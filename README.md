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

## Vinkit

- Aja `git pull` aina ennen kuin aloitat, jotta sinulla on uusin versio.
- Commit-viestin on hyvä kertoa lyhyesti, mitä muutettiin (esim. "Korjaa etusivun otsikko").
- Git ei päivitä tiedostoja reaaliajassa: muutokset näkyvät kavereille vasta `git push`in jälkeen, ja he saavat ne `git pull`illa.
- Vältä samanaikaista muokkaamista samoihin tiedostoihin, jotta vältät merge-konfliktit.
