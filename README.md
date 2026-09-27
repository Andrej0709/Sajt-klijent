# Auto Servis Vlada — sajt

Jednostrani sajt za **Auto Servis Vlada** (Beograd, Jajinci): servis i popravka vozila Peugeot i Citroën, kao i drugih vozila.

Čist HTML, CSS i JavaScript, bez frameworka i bez build koraka. Fontovi i ikonice su lokalni, pa sajt ne zavisi od spoljnih servisa.

## Sadržaj stranice

- **Hero:** naziv servisa, slogan sa flajera, dugme za poziv i animirani „dijagnostički ekran“.
- **Status radnog vremena uživo** („Otvoreno · radimo do 17:00“ / „Zatvoreno · otvaramo sutra u 09:00“), računa se po beogradskom vremenu.
- **Usluge:** kompjuterska dijagnostika, kočioni sistemi, mali i veliki servis, klima uređaji, popravke.
- **Specijalnost:** Peugeot i Citroën, i za druga vozila.
- **Kako radimo:** četiri koraka od poziva do preuzimanja vozila.
- **Kontakt:** telefon, Viber, SMS, radno vreme, lokacija (Beograd, Jajinci) sa linkom ka Google mapama.
- **Upit porukom:** mala forma koja na telefonu otvara SMS sa već upisanim tekstom, a na računaru kopira tekst poruke.
- **Na mobilnom:** traka za brzi kontakt na dnu ekrana (Pozovi · Viber · Mapa).

## Struktura

```
index.html              stranica
404.html                stranica „nije pronađeno“
assets/css/style.css    svi stilovi
assets/js/main.js       interakcije (meni, animacije, status, forma)
assets/fonts/           Barlow i Barlow Condensed (WOFF2, latinica sa č ć š ž đ)
assets/img/og-image.jpg slika koja se prikazuje kad se link deli (Viber, Facebook…)
favicon.*, icon-*.png, apple-touch-icon.png, site.webmanifest
vercel.json             bezbednosni i keš headeri za Vercel
```

## Lokalno pokretanje

```bash
npx http-server . -p 4321 -c-1
```

Zatim otvoriti http://localhost:4321.

## Objavljivanje

Sajt je spreman za Vercel: import repozitorijuma, bez podešavanja build komande. Radi i na bilo kom statičkom hostingu (Netlify, GitHub Pages, cPanel…).

## Kada bude poznat domen

1. U `index.html` dodati `<link rel="canonical" href="https://DOMEN/">` i `<meta property="og:url" content="https://DOMEN/">`.
2. `og:image` i `twitter:image` prebaciti na apsolutni URL (`https://DOMEN/assets/img/og-image.jpg`), jer Facebook i Viber traže pun link.
3. Dodati `sitemap.xml` i u `robots.txt` liniju `Sitemap: https://DOMEN/sitemap.xml`.

## Izmene sadržaja

- **Telefon** se javlja u linkovima `tel:+381641200900`, `sms:`, `viber://` i u tekstu. Pri izmeni treba zameniti sva pojavljivanja.
- **Radno vreme** se menja na tri mesta: u tekstu stranice, u JSON-LD bloku u `<head>` i u objektu `HOURS` u `assets/js/main.js`.
