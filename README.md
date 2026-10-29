# Nettisivu

Pieni nettisivuprojekti (`index.html` ja `style.css`).

Sivua voi muokata **reaaliajassa** kahdella tavalla:

1. **Selaineditori** – kuka tahansa avaa saman osoitteen ja näkee toisten muutokset heti.
2. **VS Code Live Share** – reaaliaikainen yhteismuokkaus suoraan VS Codessa.

Molemmissa muutokset tallentuvat samoihin `index.html`- ja `style.css`-tiedostoihin, joten
tavallinen git-työnkulku (commit ja push) toimii edelleen.

## 1. Selaineditori (suositus)

Editori on pieni Node.js-palvelin (`server.js`), joka

- näyttää sivun esikatselun ja koodin vierekkäin,
- tallentaa muutokset automaattisesti tiedostoihin,
- päivittää esikatselun ja muut avoinna olevat selaimet heti (SSE),
- huomaa myös VS Codessa tehdyt tallennukset.

### Asenna Node.js (kerran)

Windows PowerShell:

```powershell
winget install OpenJS.NodeJS.LTS
```

Tai lataa LTS-versio osoitteesta <https://nodejs.org/>. Tämän jälkeen sulje ja avaa pääte uudelleen.

### Käynnistä

Windowsissa kaksoisklikkaa `start.cmd`, tai komentoriviltä:

```bash
npm start
# tai
node server.js
```

Selain aukeaa automaattisesti osoitteeseen <http://localhost:4173>. Editorissa kysytään ensin
nimesi; se näkyy muille paikalla oleville.

### Kaveri mukaan

Kun palvelin käynnistyy, komentorivi tulostaa jaettavan osoitteen, esimerkiksi:

```
Jaettava osoite samassa verkossa: http://192.168.1.42:4173
```

Kaveri avaa saman osoitteen omassa selaimessaan (saman Wi-Fi-verkon sisällä). Kaikki näkevät
muutokset ja esikatselun reaaliajassa. Porttia voi vaihtaa: `node server.js --port 5000`.

> Windows saattaa kysyä ensimmäisellä käynnistyksellä palomuurilupaa. Salli yhteys
> **yksityisissä verkoissa**, jotta kaveri pääsee samaan osoitteeseen.

### Näin se toimii

- Kirjoita vasemmalla olevaan koodiin – oikealla oleva esikatselu päivittyy noin puolen sekunnin
  kuluttua ja tiedosto tallentuu levylle.
- `Ctrl+S` tallentaa heti. `Tab` lisää sisennyksen.
- Jos kaksi henkilöä muokkaa **samaa tiedostoa** yhtä aikaa, editori näyttää ristiriitailmoituksen.
  Valitse **Lataa uusin** (hylkää omat muutokset) tai **Säilytä omat** (oma versio jää voimaan).
  Näin kumpikaan ei vahingossa ylikirjoita toisen työtä.
- Erilliset työvaiheet kannattaa silti jakaa: toinen muokkaa `index.html`:ää ja toinen `style.css`:ää.

> **Huom:** editorissa ei ole käyttäjätunnuksia. Käytä sitä vain luotetussa verkossa tai
> oman tunnelin (esim. Tailscale) kautta. Älä julkaise porttia suoraan internetiin.

## 2. VS Code Live Share

Live Share sopii, kun haluat muokata koodia yhdessä VS Codessa.

1. Asenna VS Codessa laajennus **Live Share** (Extensions → hae “Live Share”).
2. Kirjaudu sisään Microsoft- tai GitHub-tilillä laajennuksen kehotteesta.
3. Avaa projektikansio VS Codessa ja paina vasemman alakulman **Share**-painiketta
   (tai `Ctrl+Shift+P` → `Live Share: Start Collaboration Session`).
4. Kopioi syntyvä linkki ja lähetä se kaverille. Kaveri avaa linkin selaimessa ja valitsee
   **Join** (tai avaa sen VS Codessa; laajennus asennetaan tarvittaessa).
5. Muutokset näkyvät molemmille reaaliajassa, ja kumpi tahansa voi tallentaa tiedostot.

Live Share ei tallenna mitään automaattisesti GitHubiin – committaa ja pushaa lopuksi.
Repoon on lisätty suositus laajennuksesta tiedostoon `.vscode/extensions.json`, joten VS Code
ehdottaa asennusta automaattisesti.

## Repon kloonaus

```bash
git clone https://github.com/Joona-hinkkanen/nettisivu.git
cd nettisivu
```

Avaa sen jälkeen kansio Visual Studio Codessa: **File → Open Folder**.

## Työskentely gitillä

1. **Hae uusimmat muutokset ennen kuin aloitat:**

   ```bash
   git pull
   ```

2. Tee muutokset tiedostoihin (selaineditorilla, Live Sharella tai VS Codessa).

3. **Tarkista muutokset ja lisää ne:**

   ```bash
   git status
   git add .
   ```

4. **Tallenna muutos commitina:**

   ```bash
   git commit -m "Lyhyt kuvaus muutoksesta"
   ```

5. **Lähetä muutokset GitHubiin:**

   ```bash
   git push
   ```

## Automaattinen commit ja push

Jos et halua committaa käsin, käynnistä automaattinen seuranta:

1. Kaksoisklikkaa repossa olevaa **`auto-commit.cmd`**-tiedostoa.
2. Komentorivi-ikkuna jää auki ja tarkistaa muutokset **2 minuutin välein**.
3. Kun muutoksia on, ne committoidaan ja pushataan GitHubiin automaattisesti.
4. Lopeta sulkemalla ikkuna tai painamalla **Ctrl+C**.

Vaihtoehtoisesti PowerShellissa:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\auto-commit.ps1
```

Tarkistusväliä voi säätää:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\auto-commit.ps1 -IntervalSeconds 60
```

Huomioitavaa:

- Seuranta committaa **kaikki** muutokset sellaisenaan — älä pidä sitä päällä, jos haluat säästää keskeneräisen työn erilliseen committiin.
- Ennen pushia se hakee muiden muutokset komennolla `git pull --rebase`.
- Jos syntyy konflikti, se pitää ratkaista käsin.

## Julkaisu

Sivusto on julkaistu GitHub Pagesilla:

**https://joona-hinkkanen.github.io/nettisivu/**

Kun muutos on pushattu `main`-branchiin, GitHub Pages päivittää sivuston automaattisesti noin minuutin kuluessa.

## Muokkaaminen selaimessa

Ilman Gitin asennusta voit muokata repoa suoraan selaimessa:

1. Avaa repo GitHubissa.
2. Paina näppäimistön **`.`** (piste), jolloin selaineditori aukeaa.
3. Muokkaa tiedostoja ja committaa muutokset suoraan `main`-branchiin.

## Vinkit

- Aja `git pull` aina ennen kuin aloitat, jotta sinulla on uusin versio.
- Commit-viestin on hyvä kertoa lyhyesti, mitä muutettiin (esim. "Korjaa etusivun otsikko").
- Git ei päivitä tiedostoja reaaliajassa: muutokset näkyvät GitHubissa vasta `git push`in jälkeen.
  Reaaliaikaiseen yhdessä tekemiseen käytä selaineditoria tai Live Sharea.
- Vältä samanaikaista muokkaamista samoihin tiedostoihin selaineditorin ja Live Sharen välillä,
  jotta vältät ristiriidat.
- Jos selaineditori ei käynnisty, tarkista että Node.js on asennettu: `node --version`.
  Portin ollessa varattu: `node server.js --port 4174`.
