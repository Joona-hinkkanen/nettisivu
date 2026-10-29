# Nettisivu

Pieni nettisivuprojekti (`index.html` ja `style.css`).

## Repon kloonaus

```bash
git clone https://github.com/Joona-hinkkanen/nettisivu.git
cd nettisivu
```

Avaa sen jälkeen kansio Visual Studio Codessa: **File → Open Folder**.

## Työskentely

1. **Hae uusimmat muutokset ennen kuin aloitat:**

   ```bash
   git pull
   ```

2. Tee muutokset tiedostoihin.

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

## Julkaisu

Sivusto on julkaistu GitHub Pagesilla:

**https://joona-hinkkanen.github.io/nettisivu/**

Kun muutos on pushattu `main`-branchiin, GitHub Pages päivittää sivuston automaattisesti noin minuutin kuluessa.

## Yhteismuokkaus reaaliajassa (Live Share)

Git ei tue samanaikaista muokkaamista. Siihen käytetään VS Coden **Live Share** -laajennusta.

**Kutsuja:**

1. Asenna VS Codeen laajennus **Live Share**.
2. Avaa projekti VS Codessa.
3. Klikkaa vasemmasta palkista **Live Share** → **Share**.
4. Kopioi syntyvä linkki ja lähetä kaverille.

**Liittyjä:**

1. Asenna **Live Share** -laajennus.
2. Avaa saamasi linkki selaimessa ja valitse **Join**.

Live Share ei tallenna muutoksia GitHubiin automaattisesti. Kun lopetat, committaa ja puskaa muutokset normaalisti:

```bash
git add .
git commit -m "Yhteismuokkaus"
git push
```

## Muokkaaminen selaimessa

Ilman Gitin asennusta voit muokata repoa suoraan selaimessa:

1. Avaa repo GitHubissa.
2. Paina näppäimistön **`.`** (piste), jolloin selaineditori aukeaa.
3. Muokkaa tiedostoja ja committaa muutokset suoraan `main`-branchiin.

## Vinkit

- Aja `git pull` aina ennen kuin aloitat, jotta sinulla on uusin versio.
- Commit-viestin on hyvä kertoa lyhyesti, mitä muutettiin (esim. "Korjaa etusivun otsikko").
- Git ei päivitä tiedostoja reaaliajassa: muutokset näkyvät kavereille vasta `git push`in jälkeen, ja he saavat ne `git pull`illa.
- Vältä samanaikaista muokkaamista samoihin tiedostoihin, jotta vältät merge-konfliktit.
