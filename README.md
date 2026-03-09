# ITA_Fitness Membership System

# 1. Opis sistema

Ta projekt predstavlja mikrostoritveni sistem za upravljanje članstev v fitness centru.

Sistem omogoča avtomatsko preverjanje veljavnosti članstva ob vstopu v fitness center. 
Član ob prihodu skenira svojo člansko kartico, sistem pa preveri:

- ali član obstaja,
- ali ima aktivno naročnino,
- ali ima poravnane vse obveznosti.

Na podlagi teh podatkov sistem odloči, ali je dostop do fitness centra dovoljen ali zavrnjen.

## Poslovni problem

 digitalizacija preverjanja članstev, ki:

- zmanjša čakalne vrste,
- odpravi ročne napake,
- izboljša uporabniško izkušnjo,
- omogoči boljši nadzor nad plačili in naročninami.

## Uporabniki sistema

- Člani fitness centra
  -  preverjanje članstva ob vstopa
  -  informacijo, ali je njihova naročnina veljavna
  -  možnost podaljšanja ali plačila naročnine

## Komunikacija med komponentami

Komunikacija prek REST API (sinhrona komunikacija)
Sporočilni posrednik za dogodke (asinhrona komunikacija)
Vsaka storitev ima svojo podatkovno bazo

# 2. Glavne domene in mikrostoritve

  # 1. Member Management
 upravlja podatke o članih fitness centra.
 Odgovornosti:
 - registracija novih članov
 - upravljanje osebnih podatkov članov
 - upravljanje identifikacijske kartice člana
 - iskanje člana na podlagi identifikacijske kartice

  # 2. Subscription Management
 upravlja naročnine članov.
 Odgovornosti:
 - ustvarjanje novih naročnin
 - določanje trajanja naročnin
 - preverjanje veljavnosti naročnine
 - podaljševanje naročnin

  # 3. Payment Management
 upravlja plačila članov.
 Odgovornosti:
 - beleženje plačil
 - pregled zgodovine plačil
 - preverjanje neporavnanih obveznosti
 - upravljanje statusa plačil

# 3. Arhitekturo sistema


<img width="1069" height="672" alt="Screenshot 2026-03-10 at 00 31 43" src="https://github.com/user-attachments/assets/b6bb9afe-c119-4d89-9a16-24e94bc5dba8" />
