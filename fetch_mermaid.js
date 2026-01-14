const fs = require('fs');
const https = require('https');

const graph = `graph TB
    subgraph Users [" Utilisateurs & Interfaces "]
        DriverApp["📱 MyKemet App (Next.js)"]
        AdminPortal["💻 Admin Dashboard (Kemet Manager)"]
    end

    subgraph Cloud [" Cloud Backend (SoftRide API) "]
        API_Gateway["API Gateway (Express Server)"]
        Auth_Service["🔐 Auth Service"]
        FOTA_Manager["📦 FOTA Manager"]
        Payment_Service["💳 FedaPay Service"]
        DB[(Supabase DB)]
        
        API_Gateway --> Auth_Service
        API_Gateway --> FOTA_Manager
        API_Gateway --> Payment_Service
        API_Gateway --> DB
    end

    subgraph External [" Services Tiers "]
        FedaPay_API["FedaPay Gateway"]
        Supabase_Auth["Supabase Auth"]
    end

    subgraph Vehicle [" Écosystème Véhicule (Kemet EV) "]
        Gateway_ECU["📡 Gateway ECU (Telematic Control Unit)"]
        
        subgraph CAN_Bus [" CAN / Ethernet Bus "]
            Cockpit_ECU["🖥️ Cockpit / Infotainment"]
            ADAS_ECU["👁️ ADAS ECU (Sentinelle)"]
            Powertrain_ECU["⚡ Powertrain / BMS"]
        end

        Gateway_ECU <--> CAN_Bus
    end

    %% Communication Links
    DriverApp -- "HTTPS / WiFi / 4G" --> API_Gateway
    AdminPortal -- "HTTPS" --> API_Gateway
    
    Gateway_ECU -- "HTTPS (Polling) / 4G / 5G" --> API_Gateway
    
    Payment_Service -- "API Key" --> FedaPay_API
    Auth_Service -- "JWT" --> Supabase_Auth

    %% Data Flow
    DriverApp -. "1. Achat Feature" .-> API_Gateway
    API_Gateway -. "2. Activation Record" .-> DB
    Gateway_ECU -. "3. Check Updates (Poll)" .-> API_Gateway
    API_Gateway -. "4. Download Firmware" .-> Gateway_ECU
    Gateway_ECU -. "5. Flash ECU" .-> ADAS_ECU`;

const encoded = Buffer.from(graph).toString('base64');
const url = `https://mermaid.ink/img/${encoded}`;

console.log("Fetching Mermaid Image from:", url);

const file = fs.createWriteStream("backend/arch.png");
https.get(url, function (response) {
    response.pipe(file);
    file.on('finish', function () {
        file.close(() => console.log("Image Downloaded!"));
    });
}).on('error', function (err) {
    fs.unlink("backend/arch.png");
    console.error("Error downloading image:", err);
});
