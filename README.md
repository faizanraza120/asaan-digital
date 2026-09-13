# Asaan Digital — GitHub Pages deployment

Website source for **https://asaandigital.online**.

This project builds with Next.js and exports a static website to `out/`.
GitHub Actions builds and publishes the site whenever `main` changes.

## Is ZIP mein kya tayyar hai?

- GitHub Pages ke liye static export configuration.
- `.github/workflows/deploy.yml` mein automatic build aur deployment.
- Aapki supplied hero image `public/portfolio/creative-studio.png` mein.
- GitHub repository URL aur custom domain, dono ke liye image paths.
- Static favicons, local assets aur domain canonical URL.

## GitHub par publish karna

1. Apne GitHub account mein `asaan-digital` naam ka repository banayein.
   GitHub Free par Pages ke liye public repository use karein. Public repository
   ka source code bhi public hota hai. Agar code private rakhna hai, pehle apne
   GitHub plan mein private-repository Pages ki availability check karein.
2. ZIP extract karein. Repository ke root mein `package.json`, `src`, `public`,
   aur `.github` hone chahiye. ZIP file ko seedha upload karne se site publish
   nahi hoti. GitHub Desktop se extracted folder ko repository mein copy,
   commit aur push kar sakte hain. `node_modules`, `.next` aur `out` git se
   automatically excluded hain.
3. Repository mein **Settings → Pages → Build and deployment → Source →
   GitHub Actions** select karein.
4. **Actions → Deploy Asaan Digital to GitHub Pages → Run workflow → main**
   chalayein. Agar pehla run Pages enable karne se pehle fail hua ho, ab
   dobara run karein.
5. Successful deployment ka link workflow ke deployment output aur
   **Settings → Pages** mein milega. Yeh default link account/repository se
   banta hai; GitHub username `faizanraza120` hai.

GitHub repository aur publishing ka kaam account access ke mutabiq yahin se
continue kiya ja sakta hai.

## asaandigital.online connect karna

Pehle repository ki **Settings → Pages → Custom domain** mein
`asaandigital.online` enter karke **Save** karein. Is Actions workflow mein
sirf `CNAME` file add karna custom-domain setting ka substitute nahi hai.

Phir Namecheap mein **Domain List → Manage (asaandigital.online) → Advanced DNS → Host Records** kholein aur website records configure karein:

| Type | Host / Name | Value |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | faizanraza120.github.io |

CNAME value isi account ke liye `faizanraza120.github.io` hai. Value mein
`https://`, slash, ya repository name add nahi karna. TTL Auto/default theek hai.

13 September 2026 ko DNS check mein yeh existing records mile:

- Root A record: `216.198.79.1`.
- `www` CNAME: `15f1377a2a66f68d.vercel-dns-017.com`.
- Nameservers: `dns1.registrar-servers.com` aur `dns2.registrar-servers.com`.
- Email MX records: `mx1.improvmx.com` aur `mx2.improvmx.com`.

DNS edit karte waqt current values dobara check karein. GitHub par migration
ke liye existing root A record aur `www` CNAME replace honge. Email ke MX aur
email verification/SPF/DKIM/DMARC TXT records ko preserve karein. Nameservers
change karne ki zaroorat nahi hai agar isi DNS panel mein records edit hote hain.

Custom domain save hone ke baad **Actions** se workflow dobara run karein:
build GitHub se naya base path leta hai. DNS check successful hone aur
certificate available hone par **Enforce HTTPS** on karein. DNS propagation
aur HTTPS option ko available hone mein 24 hours tak lag sakte hain.

End mein `https://asaandigital.online` aur
`https://www.asaandigital.online` dono open karke verify karein.

## Local development

Node.js 22 use karein; GitHub workflow bhi Node 22 use karta hai.

```bash
npm ci
npm run dev
```

Development URL: `http://localhost:3415`.

```bash
npm run build
npm run typecheck
```

Build output `out/` mein aata hai. Static export ko `next start` se serve nahi
kiya jata. Local preview ke liye, Python installed ho to:

```bash
python -m http.server 3415 --directory out
```

Custom domain ke local build mein `NEXT_PUBLIC_BASE_PATH` unset rakhein.
GitHub Actions ise repository ke current Pages settings se automatically leta hai.

## Contact details

Contact email aur booking URL `src/lib/site.ts` mein hain. Supplied booking
URL `https://cal.com/asaan-digital/15min` hai; source mein event setup pending
hone ka note tha. Public launch ke waqt event apne Cal.com account mein check
kar lein. Website par chatbot conversation ek labelled demo hai.

## Official references

- [Next.js static exports](https://nextjs.org/docs/app/guides/static-exports)
- [GitHub Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [GitHub Pages custom domains and DNS](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
