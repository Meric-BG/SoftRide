import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * MTN MoMo Callback endpoint
 * This endpoint receives notifications from MTN about payment status changes
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // MTN MoMo sends payment updates with these fields
        const {
            externalId,  // Our transaction ID
            status,      // SUCCESSFUL, FAILED, PENDING
            financialTransactionId,
            reason
        } = body;

        console.log('MTN MoMo callback received:', body);

        if (!externalId) {
            return NextResponse.json(
                { error: 'Missing externalId' },
                { status: 400 }
            );
        }

        // Get transaction from database
        const { data: transaction, error: txError } = await supabase
            .from('transactions')
            .select('*')
            .eq('transaction_id', externalId)
            .single();

        if (txError || !transaction) {
            console.error('Transaction not found:', externalId);
            return NextResponse.json(
                { error: 'Transaction not found' },
                { status: 404 }
            );
        }

        // Map MTN status to our status
        const paymentStatus = status === 'SUCCESSFUL' ? 'COMPLETED' :
            status === 'FAILED' ? 'FAILED' : 'PENDING';

        // Update transaction
        await supabase
            .from('transactions')
            .update({
                payment_status: paymentStatus,
                payment_gateway_response: body,
                completed_at: status === 'SUCCESSFUL' ? new Date().toISOString() : null,
            })
            .eq('transaction_id', externalId);

        // If payment successful, activate the feature
        if (status === 'SUCCESSFUL') {
            const items = JSON.parse(transaction.items);
            const featureId = items[0]?.feature_id;

            if (featureId) {
                const activationId = `ACT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                const subscriptionId = `SUB_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

                // Create subscription
                await supabase.from('subscriptions').insert({
                    subscription_id: subscriptionId,
                    user_id: transaction.user_id,
                    vehicle_id: transaction.vehicle_id,
                    feature_id: featureId,
                    subscription_plan: 'LIFETIME',
                    start_date: new Date().toISOString(),
                    end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                    status: 'ACTIVE',
                    price: transaction.amount,
                    currency: transaction.currency,
                    transaction_id: externalId,
                });

                // Create feature activation
                await supabase.from('feature_activations').insert({
                    activation_id: activationId,
                    subscription_id: subscriptionId,
                    vehicle_id: transaction.vehicle_id,
                    feature_id: featureId,
                    activation_status: 'ACTIVE',
                    activation_request_time: new Date().toISOString(),
                    activation_start_time: new Date().toISOString(),
                    activation_end_time: new Date().toISOString(),
                    requested_by: transaction.user_id,
                    request_source: 'MOBILE_APP',
                });

                // Send notification to user
                await supabase.from('notifications').insert({
                    notification_id: `NOTIF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    user_id: transaction.user_id,
                    vehicle_id: transaction.vehicle_id,
                    notification_type: 'FEATURE_ACTIVATION',
                    title: 'Feature activée !',
                    message: `Votre feature ${items[0]?.feature_name} a été activée avec succès.`,
                    channels: JSON.stringify(['PUSH', 'IN_APP']),
                    priority: 'NORMAL',
                    status: 'PENDING',
                });

                console.log(`Feature ${featureId} activated for vehicle ${transaction.vehicle_id}`);
            }
        }

        // Send notification for failed payment
        if (status === 'FAILED') {
            await supabase.from('notifications').insert({
                notification_id: `NOTIF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                user_id: transaction.user_id,
                vehicle_id: transaction.vehicle_id,
                notification_type: 'PAYMENT_FAILED',
                title: 'Paiement échoué',
                message: `Votre paiement a échoué. Raison: ${reason || 'Inconnue'}`,
                channels: JSON.stringify(['PUSH', 'IN_APP']),
                priority: 'HIGH',
                status: 'PENDING',
            });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('MTN MoMo callback error:', error);
        return NextResponse.json(
            { error: 'Callback processing failed' },
            { status: 500 }
        );
    }
}
