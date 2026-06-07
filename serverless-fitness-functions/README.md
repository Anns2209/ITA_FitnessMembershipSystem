# Fitness Membership Serverless Backend

Serverless/FaaS izvedba zaledja za fitnes članstva. Projekt je ločen od obstoječih mikrostoritev in je pripravljen za objavo v nov javen Git repozitorij.

## Tehnologija

- Serverless Framework
- AWS Lambda kot FaaS
- HTTP API Gateway za REST funkcije
- DynamoDB stream za podatkovne spremembe
- S3 event za datoteke
- SQS za sporočila
- EventBridge schedule za časovne dogodke
- EventBridge pattern za IoT dogodek
- CloudWatch Logs event za log/nadzorni dogodek
- Node.js 20

## Načrt glavnih funkcionalnosti

1. Avtentikacija in varovanje funkcij
   - `login` izda podpisan Bearer token.
   - `jwtAuthorizer` preveri token in zavaruje HTTP funkcije.

2. Upravljanje članov
   - `registerMember` registrira člana.
   - `getMember` vrne podatke člana.
   - `memberDbChange` se odzove na DynamoDB stream ob vstavljanju, posodobitvi ali brisanju člana.

3. Dostop v fitnes
   - `checkIn` preveri kartico, aktivno naročnino in odprte obveznosti.
   - `gateSensorEvent` sprejme IoT dogodek iz vhodnega terminala in sproži preverjanje dostopa.

4. Naročnine in plačila
   - `createSubscription` ustvari naročnino.
   - `createPayment` zabeleži plačilo.
   - `paymentProviderWebhook` obdela integracijski dogodek zunanjega ponudnika plačil.

5. Dokumenti članov
   - `uploadDocument` ustvari zahtevo za nalaganje dokumenta.
   - `documentUploaded` se odzove na S3 ObjectCreated dogodek in označi dokument kot preverjen.

6. Obveščanje, revizija in nadzor
   - `processNotification` obdela SQS sporočila za pošiljanje obvestil.
   - `nightlySubscriptionAudit` vsak dan poišče naročnine, ki se iztečejo v 7 dneh.
   - `logAlert` obdela CloudWatch log alarme.

## Uporabljeni dogodki

- Podatkovne spremembe: DynamoDB stream v `memberDbChange`.
- Shramba in datoteke: S3 ObjectCreated v `documentUploaded`.
- Sporočila in obveščanje: SQS v `processNotification`.
- Časovni dogodki: cron schedule v `nightlySubscriptionAudit`.
- Uporabniški dogodki: HTTP prijava, registracija, check-in.
- IoT dogodki: EventBridge `fitness.gate` v `gateSensorEvent`.
- Integracijski dogodki: payment provider webhook.
- Logi in nadzorni dogodki: CloudWatch Logs v `logAlert`.

## Lokalni zagon

Namestitev odvisnosti:

```bash
npm install
```

Zagon testov:

```bash
npm test
```

Zagon lokalnega API-ja:

```bash
npm run offline
```

Privzeti lokalni URL za `serverless-offline` je običajno:

```text
http://localhost:3000
```

## Primeri zahtev

Prijava:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "content-type: application/json" \
  -d '{"email":"admin@fitness.local","password":"secret"}'
```

Registracija člana:

```bash
curl -X POST http://localhost:3000/members \
  -H "content-type: application/json" \
  -H "authorization: Bearer TOKEN" \
  -d '{"name":"Ana Novak","email":"ana@example.com","cardId":"CARD-1"}'
```

Preverjanje dostopa:

```bash
curl -X POST http://localhost:3000/access/check-in \
  -H "content-type: application/json" \
  -H "authorization: Bearer TOKEN" \
  -d '{"cardId":"CARD-1"}'
```

## Testiranje s Postmanom

V mapi `postman/` je kolekcija `Fitness Serverless.postman_collection.json`. Najprej pošljite `Login`; test v kolekciji shrani token v spremenljivko `token`. Nato lahko izvajate zaščitene zahteve.

## Uvedba

Za AWS uvedbo nastavite AWS poverilnice in poženite:

```bash
npm run deploy
```

Odstranitev uvedbe:

```bash
npm run remove
```

## Objavitev v nov javen Git repozitorij

Ker v tem okolju `gh` ni nameščen, repozitorija ne morem ustvariti samodejno. Projekt je pripravljen za objavo:

```bash
cd serverless-fitness-functions
git init
git add .
git commit -m "Add serverless fitness membership backend"
git branch -M main
git remote add origin https://github.com/USERNAME/fitness-membership-serverless.git
git push -u origin main
```
