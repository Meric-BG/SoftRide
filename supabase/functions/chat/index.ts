import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Get the authorization header
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            throw new Error('No authorization header')
        }

        // Create Supabase client
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        // Verify user is authenticated
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
        if (userError || !user) {
            throw new Error('Unauthorized')
        }

        // Get the message from request body
        const { message } = await req.json()
        if (!message) {
            throw new Error('No message provided')
        }

        // Get user's vehicle info for context
        const { data: vehicle } = await supabaseClient
            .from('vehicles')
            .select('brand_name, model_name, vim')
            .eq('owner_id', user.id)
            .maybeSingle()

        // Prepare context for the AI
        const systemPrompt = `Tu es l'assistant virtuel Kemet, spécialisé dans les véhicules électriques africains. 
Tu aides les utilisateurs avec leurs véhicules Kemet (marque de voitures électriques).
${vehicle ? `L'utilisateur possède un ${vehicle.brand_name} ${vehicle.model_name}.` : ''}
Réponds de manière concise, professionnelle et amicale en français.
Si la question concerne des problèmes techniques complexes, suggère de créer un ticket support.`

        // Call OpenAI API
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message }
                ],
                temperature: 0.7,
                max_tokens: 300
            }),
        })

        if (!openaiResponse.ok) {
            const error = await openaiResponse.text()
            console.error('OpenAI API error:', error)
            throw new Error('Failed to get AI response')
        }

        const openaiData = await openaiResponse.json()
        const aiResponse = openaiData.choices[0].message.content

        return new Response(
            JSON.stringify({ response: aiResponse }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            }
        )

    } catch (error) {
        console.error('Error:', error)
        return new Response(
            JSON.stringify({
                error: error.message,
                response: "Désolé, je rencontre un problème technique. Veuillez réessayer ou créer un ticket support pour une assistance personnalisée."
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200 // Return 200 to show error message to user
            }
        )
    }
})
