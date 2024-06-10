# EduFun

EduFun je spletna izobraževalna platforma, ki omogoča uporabnikom učenje preko interaktivnih kvizov. Njegova glavna prednost je preprosta uporaba in enostavna navigacija med različnimi kategorijami kvizov. Ta dokument služi kot predstavitev projekta, navodila za namestitev aplikacije in dokumentacija za aplikacijo EduFun.
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
3. [Navodila za namestitev](#3-navodila-za-namestitev)
    - [Testno lokalno okolje](#testno-lokalno-okolje)
    - [Uporaba apliakcije](#uporaba-aplikacije)

## 1. Predstavitev projekta
### Podroben opis projekta
EduFun je spletna aplikacija, namenjena uporabnikom, ki želijo poglobiti svoje znanje na različnih področjih, kot so matematika, kemija in še veliko več. Študentje lahko rešujejo kvize, preverjajo svoje rezultate in pridobivajo povratne informacije ter mnenja drugih uporabnikov v spletni klepetalnici. Po vsakem rešenem kvizu imajo možnost vprašati AIbota o morebitnih nejasnostih, ki jim odgovori in pomaga razjasniti težave.

Poleg reševanja kvizov lahko uporabniki spremljajo svoj profil, kjer zbirajo točke za vsako uspešno opravljeno nalogo. Več točk, kot zberejo, več kvizov lahko odklenejo, kar spodbuja nadaljnje učenje in raziskovanje novih tem. EduFun združuje učenje in interakcijo v prijetno in spodbudno izkušnjo, ki omogoča uporabnikom izboljšanje znanja ter izmenjavo idej in nasvetov z drugimi uporabniki.

## 2. Dokumentacija
V dokumentaciji projekta je predstavljen celoten proces dela od začetka do konca. Prav tako so predstavljena vsa orodja in programska oprema, ki je bila tekom razvoja aplikacije uporabljena.

### Funkcionalnosti
- Pregled kategorij: Uporabniki lahko pregledajo različne kategorije kvizov, ki so na voljo na platformi. Kategorije so shranjene v Firestore.
- Podrobnosti kategorije: Uporabniki lahko izberejo kategorijo in si ogledajo vse kvize, ki so povezani s to kategorijo. Vsak kviz vsebuje seznam vprašanj.
- Podrobnosti kviza: Uporabniki lahko rešujejo vprašanja v izbranem kvizu. Vsako vprašanje ima več možnih odgovorov, od katerih je eden pravilen.
- Rezultati kviza: Po zaključku kviza uporabniki prejmejo rezultate, ki vključujejo pravilne in nepravilne odgovore ter skupno število točk.
- Chatbot: Po reševanju kviza lahko uporabniki vprašajo chatbota različna vprašanja glede teme kviza ali drugih povezanih tem.
- Spletna klepetalnica: Uporabniki lahko sodelujejo v spletni klepetalnici, kjer lahko razpravljajo o kvizih, vprašanjih in drugih izobraževalnih temah.
- Pregled profila: Uporabnik lahko preveri svoj napredek pri vsakem predmetu. Na profilu se shranjujejo točke, ki jih uporabnik prejme za reševanje kvizov. Prav tako je prikazano, koliko točk mu manjka do naslednjega nivoja.
- Odklepanje kvizov: Kvizi so razdeljeni na štiri nivoje. Uporabnik začne s prvim nivojem in odkrije naslednje nivoje z zbiranjem točk in reševanjem kvizov iz predhodnih nivojev. Vsak nivo prinaša težje izzive in bolj poglobljeno znanje.
- Shranjevanje rezultatov: Vsi rezultati kvizov in napredek uporabnikov se shranjujejo, kar omogoča pregled preteklih dosežkov in sledenje napredku skozi čas.

### Tehnološki nabor
#### Backend (zaledje)
Express.js: Strežniški okvir, uporabljen za izgradnjo RESTful API-jev in upravljanje HTTP zahtev.
Firebase: Uporabljen za avtentikacijo uporabnikov in shranjevanje podatkov. Firebase Authentication skrbi za varno prijavo in registracijo, medtem ko Firestore hrani podatke o uporabnikih, kategorijah, kvizih in rezultatih.
Socket.io: Uporabljen za omogočanje realnočasovnih klepetov v spletni klepetalnici.
OpenAI API: AI model, uporabljen za odgovarjanje na uporabnikova vprašanja in pomoč pri učenju s pomočjo AI ključa.

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
categoryScores: število točk uporabnika glede na kategorijo.

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

###### 2. Pridobitev OPENAI API Keya za delovanje AI Bota

Za konfiguracijo AI bota je potrebno pridobiti **OPENAI_API_KEY** 

1. Pojdite na [DISCORD](https://discord.com).
2. Pridružite se kanalu https://discord.gg/eTH6zgbA.
3. V stranski vrstici kliknite na tickets.
4. Kliknite na Create ticket (Ustvari vstopnico) ter kliknite na ticket(vstopnico).
5. Napišite ukaz /key get in ključ kopirajte v datoteko /EduFun/backend/.env . Nato v ticketu napišite ukaz /resetip.

<p align="center">
  <img alt="Pridobitev ključa" width="800" src="https://github.com/Tanejb/EduFun/blob/main/frontend/public/gif/GettingAPIKey.gif">
  <br/>
  Generiranje ključa
  
</p>


###### 3. Zagon backenda

Postavite se v mapo EduFun/backend in izvedite naslednje ukaze:
```bash
npm install
npm run dev
```

## 4. Uporaba aplikacije
Aplikacije je dostopna na tej [povezavi](https://edufun-2b02.onrender.com/). Uporabnik se mora pred uporabo aplikacije na njej registrirati. Ko je opravil vse korake registracije, se lahko prijavi v aplikacijo in ob uspešni prijavi dobi dostop do aplikacije.
