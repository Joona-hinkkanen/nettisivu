# Sivuston muokkausohje

Tämä sivusto on tehty tavallisella HTML:llä ja CSS:llä. Et tarvitse ohjelmointikirjastoa tai asennuksia.

## Tiedostot

- `index.html` on etusivu.
- `opinnot.html` kertoo opinnoista.
- `tyoelama.html` kertoo työelämästä.
- `lahteet.html` sisältää lähteet.
- `style.css` määrää kaikkien sivujen ulkoasun.

## Näin pääset alkuun

1. Avaa haluamasi `.html`-tiedosto.
2. Etsi tekstikohta, jota haluat muuttaa, ja kirjoita uusi teksti vanhan tilalle.
3. Tallenna painamalla `Ctrl+S`.
4. Avaa `index.html` selaimessa. Näet muutoksen päivittämällä selaimen.

## Tekstin muokkaaminen

HTML-tunniste kertoo, millainen sisältö on kyseessä. Muuta tekstisisältöä tunnisteiden välistä ja jätä tunnisteet paikoilleen:

```html
<h2>Tämä on väliotsikko</h2>
<p>Tämä on tavallinen tekstikappale.</p>
```

Listassa jokainen kohta on omien `<li>`- ja `</li>`-tunnisteiden välissä:

```html
<ul>
  <li>Ensimmäinen kohta</li>
  <li>Toinen kohta</li>
</ul>
```

Linkissä näkyvä teksti on `<a>`-tunnisteiden välissä ja osoite `href`-arvossa:

```html
<a href="opinnot.html">Tutustu opintoihin</a>
```

## Ulkoasun muokkaaminen

Avaa `style.css`. Värit ja sivun enimmäisleveys löytyvät tiedoston alusta `:root`-kohdasta:

```css
:root {
  --tausta: #fff7fa;
  --teksti: #2b1821;
  --pinkki: #d3316b;
  --sivun-leveys: 68rem;
}
```

Vaihda kaksoispisteen jälkeinen arvo. Esimerkiksi `--pinkki` vaihtaa korostusväriä ja `--sivun-leveys` sivun leveyttä. Väriarvo alkaa risuaidalla, kuten `#d3316b`.

Tiedoston loppupuolen `@media`-kohdat säätävät ulkoasua kapeille näytöille. Niitä ei yleensä tarvitse muuttaa, kun vaihdat vain tekstejä tai värejä.

## Valikon linkit

Ylävalikko on jokaisessa HTML-tiedostossa erikseen. Jos lisäät tai nimeät sivun uudelleen, päivitä valikon linkki kaikissa neljässä HTML-tiedostossa. Linkin `href` on tiedoston nimi, esimerkiksi `tyoelama.html`.

## Jos jokin menee pieleen

- Jos sivulta katoaa sisältöä, tarkista ettet poistanut HTML-tunnisteen alkua tai loppua. Esimerkiksi `<p>` suljetaan tunnisteella `</p>`.
- Jos linkki ei toimi, tarkista että `href`-arvo vastaa tiedoston nimeä.
- Jos ulkoasu ei muutu, tarkista että muokkasit `style.css`-tiedostoa ja päivitä selain.
- Muuta yhtä asiaa kerrallaan. Silloin virheen löytää helpommin.