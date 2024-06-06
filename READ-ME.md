# EduFun

<p align="center">
  <img alt="EduFun Logo" width="400" src="" >
</p>

EduFun,EduFun je spletna izobraževalna platforma, ki omogoča uporabnikom učenje preko interaktivnih kvizov. Njegova glavna prednost je preprosta uporaba in enostavna navigacija med različnimi kategorijami kvizov. Ta dokument služi kot predstavitev projekta, navodila za namestitev aplikacije in dokumentacija za aplikacijo EduFun.
### Člani ekipe 
- [Tanej Buhin](https://github.com/Tanejb)
- [Oliver Kunovski](https://github.com/oliverkunovski)
- [Amadej Buhin](https://github.com/amadejbuhin)

## Kazalo vsebine
1. [Predstavitev projekt](#1-predstavitev-projekta)
    - [Podroben opis projekta](#podroben-opis-projekta)
2. [Dokumentacija](#2-dokumentacija)
    - [Funkcionalnosti](#funkcionalnosti)
    - [Tehnološki nabor](#tehnološki-nabor)
    - [Organizacija in način dela](#organizacija-in-način-dela)
    - [Zasnova podatkovne strukture](#zasnova-podatkovne-strukture)
    - [Wireframe aplikacije (prototip izgleda)](#wireframe-aplikacije-prototip-izgleda)
3. [Navodila za namestitev](#3-navodila-za-namestitev)
    - [Testno lokalno okolje](#testno-lokalnmo-okolje)
    - [Uporaba apliakcije](#uporaba-aplikacije)
    - [Uporabniški priročnik](#uporabniški-priročnik)

## 1. Predstavitev projekta
### Podroben opis projekta
EduFun je spletna izobraževalna platforma, zasnovana za pomoč uporabnikom pri učenju in preverjanju njihovega znanja preko interaktivnih kvizov. Sistem omogoča registracijo in prijavo uporabnikov, pregled kategorij kvizov, reševanje kvizov ter prikaz rezultatov. Poleg tega omogoča uporabo chatbota, sodelovanje v spletni klepetalnici ter prejemanje prilagojenih predlogov za izboljšanje glede na uporabnikove odgovore.

## 2. Dokumentacija
V dokumentaciji projekta je predstavljen celoten proces dela od začetka do konca. Prav tako so predstavljena vsa orodja in programska oprema, ki je bila tekom razvoja aplikacije uporabljena.

### Funkcionalnosti
- Pregled kategorij: Uporabniki lahko pregledajo različne kategorije kvizov, ki so na voljo na platformi. Kategorije so shranjene v Firestore.
- Podrobnosti kategorije: Uporabniki lahko izberejo kategorijo in si ogledajo vse kvize, ki so povezani s to kategorijo. Vsak kviz vsebuje seznam vprašanj.
- Podrobnosti kviza: Uporabniki lahko rešujejo vprašanja v izbranem kvizu. Vsako vprašanje ima več možnih odgovorov, od katerih je eden pravilen.
- Rezultati kviza: Po zaključku kviza uporabniki prejmejo rezultate, ki vključujejo pravilne in nepravilne odgovore ter skupno število točk.
- Chatbot: Po reševanju kviza lahko uporabniki vprašajo chatbota različna vprašanja glede teme kviza ali drugih povezanih tem.
- Spletna klepetalnica: Uporabniki lahko sodelujejo v spletni klepetalnici, kjer lahko razpravljajo o kvizih, vprašanjih in drugih izobraževalnih temah.
- Virtualni mentor: Sistem analizira uporabnikove odgovore in rezultate kvizov ter ponuja predloge za izboljšanje, predlagane rešitve za napačne odgovore in nasvete za področja, kjer uporabnik potrebuje več pomoči.

### Tehnološki nabor
#### Backend (zaledje)
Express.js: Strežniški okvir, uporabljen za izgradnjo RESTful API-jev in upravljanje HTTP zahtev.
Firebase: Uporabljen za avtentikacijo uporabnikov in shranjevanje podatkov. Firebase Authentication skrbi za varno prijavo in registracijo, medtem ko Firestore hrani podatke o uporabnikih, kategorijah, kvizih in rezultatih.
Socket.io: Uporabljen za omogočanje realnočasovnih klepetov v spletni klepetalnici.

#### Frontend (pročelje)
HTML/CSS/JavaScript: Osnovne tehnologije za izdelavo uporabniškega vmesnika.
Bootstrap: CSS framework, uporabljen za oblikovanje in responsivnost uporabniškega vmesnika.
EJS (Embedded JavaScript): Predlogovni motor, uporabljen za renderiranje dinamičnih HTML strani na strežniku.
Socket.io-client: Klientska knjižnica za povezavo s Socket.io strežnikom in omogočanje realnočasovne komunikacije.

### Organizacija in način dela
#### Komunikacija
Vsa komunikacija znotraj projekta je bila speljana preko [Discord](https://discord.com) strežnika, razen komuniciranje s profesorjem, ki je bilo preko [Microsoft Teams]. Prav tako smo preko Discord strežnika izvedli vse skupinske sestanke in vso delo na daljavo, kjer smo si pomagali s funkcijo deljenja zaslona.

### Zasnova podatkovne strukture
Za shranjevanje podatkov v projektu EduFun smo uporabili Firebase Firestore, kjer uporabljamo različne zbirke. Struktura temelji na kategorijah kvizov, uporabniških računih in rezultatih kvizov.

#### Zbirke:
Users:
Beleži podatke o registriranih uporabnikih.
Atributi:
uid: Unikatni identifikator uporabnika.
email: Email naslov uporabnika.
createdAt: Datum in čas registracije uporabnika.

Categories:
Beleži različne kategorije kvizov.
Atributi:
name: Ime kategorije.

Quizzes:
Beleži podatke o kvizih znotraj posameznih kategorij.
Atributi:
title: Naslov kviza.
categoryId: ID kategorije, kateri kviz pripada.
level: zahtevnost kviza

Questions:
Beleži vprašanja, povezana s posameznim kvizom.
Atributi:
quizId: ID kviza, kateremu vprašanje pripada.
question: Besedilo vprašanja.
options: Seznam možnih odgovorov.
correct_answer: Indeks pravilnega odgovora v seznamu možnosti.
value: vrednost pravilnega odgovora

Results:
Beleži rezultate reševanja kvizov.
Atributi:
quizId: ID kviza, katerega rezultat beleži.
userId: ID uporabnika, ki je reševal kviz.
score: Število doseženih točk.
completed_at: Datum in čas zaključka kviza.


## 3. Navodila za namestitev 

#### Koraki za zagon

###### 1. Kloniranje repozitorija

Najprej klonirajte repozitorij na vašo lokalno napravo.

###### 2. Pridobitev firebase serviceAccountKey.json datoteke za backend

Za konfiguracijo Firebase je potrebno pridobiti **serviceAccountKey.json** 

1. Pojdite na [Firebase Console](https://firebase.google.com).
2. Izberite svoj projekt.
3. V stranski vrstici kliknite na Project Settings (Nastavitve projekta).
4. Izberite zavihek Service accounts (Storitveni računi).
5. Izberite Java in kliknite na gumb Generate new private key (Ustvari nov zasebni ključ). To bo preneslo datoteko **serviceAccountKey.json** na vaš računalnik.

Ustvarjeno datoteko kopirajte v **EduFun/backend**
