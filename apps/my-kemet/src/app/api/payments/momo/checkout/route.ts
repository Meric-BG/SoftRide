import { NextRequest, NextResponse } from 'next/server';
import { getMoMoClient } from '@/lib/mtn-momo';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { featureId, vehicleId, userId, phoneNumber } = body;

        // Validate input
        if (!featureId || !vehicleId || !userId || !phoneNumber) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Get feature details from database
        const { data: feature, error: featureError } = await supabase
            .from('features')
            .select('feature_id, feature_name, base_price, currency')
            .eq('feature_id', featureId)
            .single();

        if (featureError || !feature) {
            return NextResponse.json(
                { error: 'Feature not found' },
                { status: 404 }
            );
        }

        // Validate phone number format (Benin: +229XXXXXXXX)
        const phoneRegex = /^(\+229|00229|229)?[0-9]{8}$/;
        if (!phoneRegex.test(phoneNumber)) {
            return NextResponse.json(
                { error: 'Invalid phone number format. Use +229XXXXXXXX' },
                { status: 400 }
            );
        }

        // Format phone number
        const formattedPhone = phoneNumber.replace(/^(\+229|00229|229)/, '229');

        // Validate account holder
        const momoClient = getMoMoClient();
        const isValid = await momoClient.validateAccountHolder(formattedPhone);

        if (!isValid) {
            return NextResponse.json(
                { error: 'Phone number not registered with MTN Mobile Money' },
                { status: 400 }
            );
        }

        // Create transaction record
        const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const { error: txError } = await supabase
            .from('transactions')
            .insert({
                transaction_id: transactionId,
                user_id: userId,
                vehicle_id: vehicleId,
                transaction_type: 'PURCHASE',
                amount: feature.base_price,
                currency: feature.currency || 'XOF',
                payment_method: 'MTN_MOBILE_MONEY',
                payment_status: 'PENDING',
                items: JSON.stringify([{ feature_id: featureId, feature_name: feature.feature_name }]),
            });

        if (txError) {
            console.error('Transaction creation error:', txError);
            return NextResponse.json(
                { error: 'Failed to create transaction' },
                { status: 500 }
            );
        }

        // Request payment from MTN MoMo
        const referenceId = await momoClient.requestToPay({
            amount: feature.base_price.toString(),
            currency: feature.currency || 'XOF',
            externalId: transactionId,
            payer: {
                partyIdType: 'MSISDN',
                partyId: formattedPhone,
            },
            payerMessage: `Achat ${feature.feature_name}`,
            payeeNote: `Feature ${featureId} pour véhicule ${vehicleId}`,
        });

        // Update transaction with reference ID
        await supabase
            .from('transactions')
            .update({
                payment_gateway_transaction_id: referenceId,
            })
            .eq('transaction_id', transactionId);

        return NextResponse.json({
            success: true,
            transactionId,
            referenceId,
            message: 'Payment request sent. Please approve on your phone.',
        });

    } catch (error) {
        console.error('MTN MoMo checkout error:', error);
        return NextResponse.json(
            { error: 'Payment processing failed', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

// Check payment status
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const transactionId = searchParams.get('transactionId');

        if (!transactionId) {
            return NextResponse.json(
                { error: 'Transaction ID required' },
                { status: 400 }
            );
        }

        // Get transaction from database
        const { data: transaction, error: txError } = await supabase
            .from('transactions')
            .select('*')
            .eq('transaction_id', transactionId)
            .single();

        if (txError || !transaction) {
            return NextResponse.json(
                { error: 'Transaction not found' },
                { status: 404 }
            );
        }

        // Check payment status with MTN MoMo
        const momoClient = getMoMoClient();
        const paymentStatus = await momoClient.getPaymentStatus(
            transaction.payment_gateway_transaction_id
        );

        // Update transaction status
        const newStatus = paymentStatus.status === 'SUCCESSFUL' ? 'COMPLETED' :
            paymentStatus.status === 'FAILED' ? 'FAILED' : 'PENDING';

        await supabase
            .from('transactions')
            .update({
                payment_status: newStatus,
                payment_gateway_response: paymentStatus,
                completed_at: paymentStatus.status === 'SUCCESSFUL' ? new Date().toISOString() : null,
            })
            .eq('transaction_id', transactionId);

        // If successful, activate the feature
        if (paymentStatus.status === 'SUCCESSFUL') {
            const items = JSON.parse(transaction.items);
            const featureId = items[0]?.feature_id;

            if (featureId) {
                const activationId = `ACT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

                // Create subscription
                const subscriptionId = `SUB_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                await supabase.from('subscriptions').insert({
                    subscription_id: subscriptionId,
                    user_id: transaction.user_id,
                    vehicle_id: transaction.vehicle_id,
                    feature_id: featureId,
                    subscription_plan: 'LIFETIME',
                    start_date: new Date().toISOString(),
                    end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
                    status: 'ACTIVE',
                    price: transaction.amount,
                    currency: transaction.currency,
                    transaction_id: transactionId,
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
            }
        }

        return NextResponse.json({
            transactionId,
            status: newStatus,
            paymentStatus,
        });

    } catch (error) {
        console.error('Payment status check error:', error);
        return NextResponse.json(
            { error: 'Failed to check payment status' },
            { status: 500 }
        );
    }
}
