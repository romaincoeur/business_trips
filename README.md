# Saisies des frais de déplacement Wild Code School

Le fichier parameters.js doit déclarer les variables suivantes

    CLIENT_ID : fourni par Google Developper Console
    SPREADSHEET_ID : L'id de ton Google Sheet 'NOTE DE FRAIS'
    SCRIPT_ID : L'id du Google Script qui va avec le spreadsheet
    
## Installation

Ce script s'installe très bien sur un serveur local

    cd /var/www/html
    git init git@github.com:romaincoeur/business_trips.git
    cd business_trips
    touch parameters.js

Dans le Spreadsheet 'NOTE DE FRAIS',
1- Cliquer sur Outils->Editeur de scripts
2- Coller le contenu du fichier code.gs
3- Publier en tant qu'Exécutable d'API
4- Donner les authorisations depuis la [console développeur]([https://console.developers.google.com])

## Liens utiles

* [https://console.developers.google.com](https://console.developers.google.com)