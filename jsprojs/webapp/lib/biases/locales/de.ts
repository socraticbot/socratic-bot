import type { LocaleCards } from './types';

export const de: LocaleCards = {
  'confirmation-bias': {
    name: 'Bestätigungsfehler',
    definition: 'Informationen bevorzugen, die zu dem passen, was wir ohnehin glauben.',
    scenario:
      'Miriam ist sicher, dass ihr neuer Kollege sie nicht mag. Sie erinnert sich genau an den Morgen, an dem er nicht gegrüßt hat, und an das Meeting, in dem er ihr ins Wort gefallen ist, aber nicht an die drei Male, als er ihr geholfen hat.',
    options: ['Ankereffekt', 'Bestätigungsfehler', 'Versunkene-Kosten-Falle'],
    explanation:
      'Miriam bemerkt und behält, was zu ihrer Überzeugung passt, und lässt den Rest entgleiten. So wirkt die Überzeugung besser belegt, als sie ist.',
    counterMove: 'Frag dich: Was würde ich sehen, wenn ich falschläge, und habe ich danach gesucht?',
  },
  anchoring: {
    name: 'Ankereffekt',
    definition: 'Sich zu stark auf die erste Zahl oder Information stützen, die wir sehen.',
    scenario:
      'Ein Gebrauchtwagen ist für 18.000 Euro inseriert. Nach zähem Verhandeln zahlt Jonas 15.500 Euro und hält das für ein tolles Geschäft, obwohl vergleichbare Autos für etwa 14.000 Euro verkauft werden.',
    options: ['Halo-Effekt', 'Spielerfehlschluss', 'Ankereffekt'],
    explanation:
      'Der Angebotspreis hat einen Bezugspunkt gesetzt. Jonas hat das Geschäft an den 18.000 Euro gemessen statt an dem, was das Auto wirklich wert ist.',
    counterMove: 'Bevor du die Zahl von jemand anderem siehst, schreib deine eigene Schätzung auf.',
  },
  'availability-heuristic': {
    name: 'Verfügbarkeitsheuristik',
    definition: 'Einschätzen, wie wahrscheinlich etwas ist, danach, wie leicht uns Beispiele einfallen.',
    scenario:
      'Nach einer Woche voller Nachrichten über einen Flugzeugabsturz beschließt Katrin, 900 km mit dem Auto zu fahren, statt zu fliegen. Sie hält das für die sicherere Wahl.',
    options: ['Verfügbarkeitsheuristik', 'Status-quo-Verzerrung', 'Fluch des Wissens'],
    explanation:
      'Anschauliche, frische Berichte machen Abstürze leicht vorstellbar, deshalb wirken sie häufig. Pro Kilometer ist Autofahren weit riskanter als Fliegen.',
    counterMove: 'Frag dich: Was sagen die tatsächlichen Zahlen, nicht die einprägsamen Beispiele?',
  },
  'framing-effect': {
    name: 'Framing-Effekt',
    definition: 'Auf dieselbe Information unterschiedlich reagieren, je nachdem, wie sie dargestellt wird.',
    scenario:
      'Eine Ärztin beschreibt zwei Patienten dieselbe Operation. Der eine hört: „90 % der Patienten überleben.“ Der andere hört: „10 % der Patienten sterben.“ Der erste ist viel eher bereit, sich operieren zu lassen.',
    options: ['Optimismus-Verzerrung', 'Framing-Effekt', 'Ankereffekt'],
    explanation:
      'Beide Sätze beschreiben genau dieselben Chancen. Die Formulierung als Gewinn oder Verlust hat die Entscheidung verändert, nicht die Fakten.',
    counterMove: 'Formuliere die Wahl andersherum und prüfe, ob sich deine Antwort ändert.',
  },
  'sunk-cost-fallacy': {
    name: 'Versunkene-Kosten-Falle',
    definition: 'Weitermachen, weil wir schon so viel in etwas gesteckt haben.',
    scenario:
      'Sophie sitzt seit einer Stunde in einem Film, der ihr nicht gefällt. Sie bleibt bis zum Schluss, weil sie die Kinokarte ja schon bezahlt hat.',
    options: ['Spielerfehlschluss', 'Status-quo-Verzerrung', 'Versunkene-Kosten-Falle'],
    explanation:
      'Das Geld für die Karte ist weg, ob sie bleibt oder geht. Nur über die nächste Stunde kann sie noch entscheiden.',
    counterMove: 'Frag dich: Wenn ich noch nichts investiert hätte, würde ich mich jetzt dafür entscheiden?',
  },
  'survivorship-bias': {
    name: 'Survivorship Bias',
    definition: 'Schlüsse nur aus den Fällen ziehen, die es geschafft haben.',
    scenario:
      'Ein Magazin porträtiert zehn Studienabbrecher, die Milliardäre wurden, und folgert, dass ein Abbruch des Studiums ein kluger Weg zum Erfolg ist.',
    options: ['Survivorship Bias', 'Halo-Effekt', 'Falscher Konsensus-Effekt'],
    explanation:
      'Die vielen Studienabbrecher, die keine Milliardäre wurden, stehen nicht im Magazin. Die Auswahl zeigt also nur die Gewinner.',
    counterMove: 'Frag dich: Wer hat dasselbe versucht und ist gescheitert, und warum sehe ich diese Leute nicht?',
  },
  'confirmation-bias-review': {
    name: 'Bestätigungsfehler',
    definition: 'Informationen bevorzugen, die zu dem passen, was wir ohnehin glauben.',
    scenario:
      'Tobias glaubt, dass ihm seine neue Ernährung mehr Energie gibt. Er bemerkt jeden Tag, an dem er sich großartig fühlt, und vergisst die müden Tage. So scheint die Ernährung zu wirken.',
    options: ['Versunkene-Kosten-Falle', 'Survivorship Bias', 'Bestätigungsfehler'],
    explanation:
      'Gezählt wurden nur die Tage, die zur Überzeugung passen. Deshalb sieht die Ernährung besser aus, als die Belege hergeben.',
    counterMove: 'Frag dich: Was würde ich sehen, wenn ich falschläge, und habe ich danach gesucht?',
  },
  'fundamental-attribution-error': {
    name: 'Fundamentaler Attributionsfehler',
    definition: 'Das Verhalten anderer mit ihrem Charakter erklären und ihre Lage übersehen.',
    scenario:
      'Eine Kassiererin ist kurz angebunden zu Felix. Felix beschließt, dass sie einfach ein unfreundlicher Mensch ist, ohne daran zu denken, dass sie vielleicht gerade am Ende einer Zwölfstundenschicht steht.',
    options: ['Fluch des Wissens', 'Fundamentaler Attributionsfehler', 'Bestätigungsfehler'],
    explanation:
      'Felix hat vorschnell darüber geurteilt, wer die Kassiererin ist. Die Situation erklärt viel Verhalten, und bei anderen Menschen gewichten wir sie zu gering.',
    counterMove: 'Frag dich: In welcher Lage würde ein vernünftiger Mensch so handeln?',
  },
  'status-quo-bias': {
    name: 'Status-quo-Verzerrung',
    definition: 'Lieber alles so lassen, wie es ist, auch wenn eine Änderung besser wäre.',
    scenario:
      'Eine Firma stellt ihre betriebliche Altersvorsorge um: Neue Mitarbeitende sind automatisch dabei, wenn sie nicht widersprechen. Die Teilnahme steigt stark, obwohl die Angebote genau dieselben sind wie vorher.',
    options: ['Status-quo-Verzerrung', 'Optimismus-Verzerrung', 'Verzerrungsblindheit'],
    explanation:
      'Viele Menschen bleiben bei dem, was voreingestellt ist. Eine neue Voreinstellung hat das Verhalten verändert, ohne an den Möglichkeiten etwas zu ändern.',
    counterMove: 'Frag dich: Wäre die andere Option voreingestellt, würde ich zu dieser wechseln?',
  },
  'halo-effect': {
    name: 'Halo-Effekt',
    definition: 'Einen guten Eindruck auf unser Urteil über ganz andere Eigenschaften abfärben lassen.',
    scenario:
      'Eine Bewerberin tritt selbstbewusst und gut gekleidet auf. Der Interviewer bewertet ihre Ehrlichkeit und ihr Fachwissen höher, obwohl das Gespräch beides gar nicht geprüft hat.',
    options: ['Ankereffekt', 'Falscher Konsensus-Effekt', 'Halo-Effekt'],
    explanation:
      'Eine positive Eigenschaft ist auf die Bewertung von Eigenschaften übergeschwappt, über die der Interviewer nichts wusste.',
    counterMove: 'Bewerte jede Eigenschaft einzeln und nur anhand der Belege für genau diese Eigenschaft.',
  },
  'false-consensus': {
    name: 'Falscher Konsensus-Effekt',
    definition: 'Überschätzen, wie viele Menschen unsere Meinungen und Gewohnheiten teilen.',
    scenario:
      'Anja liebt Pizza Hawaii und ist überrascht, dass die meisten Kolleginnen und Kollegen sie nicht mögen. Anja war davon ausgegangen, dass fast alle das so sehen.',
    options: ['Falscher Konsensus-Effekt', 'Survivorship Bias', 'Framing-Effekt'],
    explanation:
      'Die eigene Sicht fühlt sich normal an, also halten wir sie für verbreitet. Anja hat eine persönliche Vorliebe auf die Gruppe übertragen.',
    counterMove: 'Frag dich: Wie würde ich tatsächlich herausfinden, was andere denken?',
  },
  'gamblers-fallacy': {
    name: 'Spielerfehlschluss',
    definition: 'Glauben, dass vergangene Zufallsereignisse die Chancen künftiger verändern.',
    scenario:
      'Beim Roulette fällt die Kugel sechsmal hintereinander auf Rot. Jana setzt viel auf Schwarz, sicher, dass Schwarz jetzt „dran“ ist.',
    options: ['Versunkene-Kosten-Falle', 'Spielerfehlschluss', 'Verfügbarkeitsheuristik'],
    explanation:
      'Jede Runde ist unabhängig. Das Rad hat kein Gedächtnis, also ist die Chance auf Schwarz dieselbe wie bei jeder anderen Runde.',
    counterMove: 'Frag dich: Hat dieser Vorgang irgendein Gedächtnis für frühere Ergebnisse?',
  },
  'curse-of-knowledge': {
    name: 'Fluch des Wissens',
    definition: 'Vergessen, wie es ist, etwas nicht zu wissen, das wir gut kennen.',
    scenario:
      'Eine Expertin schreibt die Einrichtungsanleitung für eine neue App und lässt die Schritte weg, die ihr selbstverständlich vorkommen. Die meisten Anfänger bleiben bei Schritt zwei hängen.',
    options: ['Fluch des Wissens', 'Fundamentaler Attributionsfehler', 'Halo-Effekt'],
    explanation:
      'Wenn wir etwas einmal wissen, können wir uns kaum noch vorstellen, es nicht zu wissen. Deshalb lassen wir weg, was Anfänger brauchen.',
    counterMove: 'Lass es jemand Neues ausprobieren, oder erkläre es so, als hätte die Person es noch nie gesehen.',
  },
  'anchoring-review': {
    name: 'Ankereffekt',
    definition: 'Sich zu stark auf die erste Zahl oder Information stützen, die wir sehen.',
    scenario:
      'Ein Spendenformular schlägt 100, 250 oder 500 Euro vor. Hannah, die 50 Euro geben wollte, spendet 100 Euro.',
    options: ['Ankereffekt', 'Halo-Effekt', 'Fluch des Wissens'],
    explanation:
      'Die vorgeschlagenen Beträge haben einen Bezugspunkt gesetzt, der die Spende nach oben gezogen hat.',
    counterMove: 'Bevor du die Zahl von jemand anderem siehst, schreib deine eigene Schätzung auf.',
  },
  'automation-bias': {
    name: 'Automation Bias',
    definition: 'Automatischen Systemen mehr trauen als dem eigenen Urteil und dem, was wir vor Augen haben.',
    scenario:
      'Eine Navi-App schickt einen Autofahrer in eine Straße mit dem Schild „Straße gesperrt“. Der Fahrer folgt der App und bleibt stecken.',
    options: ['Status-quo-Verzerrung', 'Automation Bias', 'Ankereffekt'],
    explanation:
      'Der Fahrer hat die App über einen klaren Hinweis gestellt. Dasselbe kann mit KI-Werkzeugen passieren, auch mit diesem hier.',
    counterMove: 'Sieh die Ausgabe eines Werkzeugs als Vorschlag und prüfe sie an dem, was du selbst sehen kannst.',
  },
  'bias-blind-spot': {
    name: 'Verzerrungsblindheit',
    definition: 'Denkfehler bei anderen leichter erkennen als bei uns selbst.',
    scenario:
      'Nachdem Nele über kognitive Verzerrungen gelesen hat, kommt sie zu dem Schluss, dass die meisten Menschen ziemlich voreingenommen sind. Ihr eigenes Urteil hält sie aber für besser als der Durchschnitt.',
    options: ['Verzerrungsblindheit', 'Optimismus-Verzerrung', 'Falscher Konsensus-Effekt'],
    explanation:
      'Wer über Denkfehler liest, erkennt sie danach meist besser bei anderen, nicht bei sich selbst.',
    counterMove: 'Geh davon aus, dass du ungefähr so voreingenommen bist wie alle anderen, und such nach dem Wo.',
  },
  'planning-fallacy': {
    name: 'Planungsfehlschluss',
    definition: 'Unterschätzen, wie lange unsere eigenen Aufgaben dauern, auch wenn wir schon oft zu spät waren.',
    scenario:
      'Stefan will einen Bericht an einem Abend fertig schreiben. Die letzten vier Berichte haben jeweils etwa drei Abende gedauert, aber Stefan ist sicher, dass es diesmal anders wird.',
    options: ['Planungsfehlschluss', 'Versunkene-Kosten-Falle', 'Verzerrungsblindheit'],
    explanation:
      'Stefan hat vom besten Fall für diese Aufgabe aus geplant statt davon, wie lange ähnliche Aufgaben tatsächlich gedauert haben.',
    counterMove: 'Geh davon aus, wie lange ähnliche Aufgaben wirklich gedauert haben, und passe dann an.',
  },
  'base-rate-neglect': {
    name: 'Basisratenfehler',
    definition: 'Außer Acht lassen, wie häufig etwas insgesamt ist, wenn wir einen Einzelfall beurteilen.',
    scenario:
      'Paul ist ruhig, liebt Bücher und hält seinen Schreibtisch ordentlich. Auf die Frage, ob Paul eher Bibliothekar oder Verkäufer ist, sagen die meisten Bibliothekar, obwohl es um ein Vielfaches mehr Verkäufer als Bibliothekare gibt.',
    options: ['Halo-Effekt', 'Basisratenfehler', 'Ankereffekt'],
    explanation:
      'Die Beschreibung passt zum Klischee des Bibliothekars, aber es gibt so viel mehr Verkäufer, dass ein ruhiger, belesener Verkäufer trotzdem wahrscheinlicher ist.',
    counterMove: 'Frag dich: Wie häufig ist jede Möglichkeit, bevor ich mir die Details ansehe?',
  },
  'hindsight-bias': {
    name: 'Rückschaufehler',
    definition: 'Nachdem etwas passiert ist, glauben, wir hätten es kommen sehen.',
    scenario:
      'Nachdem ihre Mannschaft das Finale verloren hat, erzählt Lena ihren Freunden, sie habe immer gewusst, dass die Abwehr zu schwach ist. Vor dem Spiel hatte sie einen klaren Sieg vorhergesagt.',
    options: ['Bestätigungsfehler', 'Planungsfehlschluss', 'Rückschaufehler'],
    explanation:
      'Wenn wir den Ausgang kennen, verändert das unsere Erinnerung an das, was wir erwartet haben. Das Ergebnis wirkt dann, als wäre es schon immer absehbar gewesen.',
    counterMove: 'Schreib Vorhersagen auf, bevor du den Ausgang kennst, und vergleiche dann.',
  },
  'authority-bias': {
    name: 'Autoritätsheuristik',
    definition: 'Einer Aussage mehr Gewicht geben, weil eine bestimmte Person sie macht, auch außerhalb ihres Fachs.',
    scenario:
      'Ein berühmter Herzchirurg empfiehlt in einer Werbung eine neue Haushaltsbuch-App. Viele Zuschauer laden sie herunter, weil sie seinem Urteil in Geldfragen vertrauen.',
    options: ['Autoritätsheuristik', 'Status-quo-Verzerrung', 'Planungsfehlschluss'],
    explanation:
      'Fachwissen in einem Gebiet überträgt sich nicht auf ein anderes, aber das Ansehen des Chirurgen lässt den Rat glaubwürdig wirken.',
    counterMove: 'Frag dich: Ist diese Person Fachmann oder Fachfrau für genau diese Frage?',
  },
  'sunk-cost-fallacy-review': {
    name: 'Versunkene-Kosten-Falle',
    definition: 'Weitermachen, weil wir schon so viel in etwas gesteckt haben.',
    scenario:
      'Eine Firma hat zwei Jahre in eine Software gesteckt, die immer noch nicht funktioniert. Die Geschäftsführung bewilligt ein weiteres Jahr Budget, weil „wir schon zu viel investiert haben, um jetzt aufzuhören“.',
    options: ['Status-quo-Verzerrung', 'Versunkene-Kosten-Falle', 'Rückschaufehler'],
    explanation:
      'Die zwei Jahre sind so oder so verbraucht. Die einzige Frage ist, ob das nächste Jahr Budget es wert ist.',
    counterMove: 'Frag dich: Wenn ich noch nichts investiert hätte, würde ich mich jetzt dafür entscheiden?',
  },
  'belief-bias': {
    name: 'Belief-Bias',
    definition: 'Die Logik eines Arguments danach beurteilen, ob uns sein Schluss gefällt.',
    scenario:
      'Nimm dieses Argument: „Alle Blumen brauchen Wasser. Rosen brauchen Wasser. Also sind Rosen Blumen.“ Viele Menschen halten es für logisch einwandfrei, weil der Schluss stimmt.',
    options: ['Spielerfehlschluss', 'Bestätigungsfehler', 'Belief-Bias'],
    explanation:
      'Dass etwas Wasser braucht, macht es noch nicht zur Blume. Die Begründung ist also fehlerhaft, auch wenn der Schluss zufällig stimmt. Ein glaubwürdiger Schluss hat ein schlechtes Argument verdeckt.',
    counterMove: 'Setz einen Schluss ein, den du ablehnst, und prüfe, ob die Logik dann noch in Ordnung wirkt.',
  },
  'self-serving-bias': {
    name: 'Selbstwertdienliche Verzerrung',
    definition: 'Erfolge uns selbst zuschreiben und Misserfolge den Umständen.',
    scenario:
      'Als Daniels Präsentation gut läuft, schreibt er das seiner Vorbereitung zu. Als die nächste danebengeht, gibt er dem Beamer und einem schwierigen Publikum die Schuld.',
    options: ['Selbstwertdienliche Verzerrung', 'Fundamentaler Attributionsfehler', 'Rückschaufehler'],
    explanation:
      'Erfolge auf uns und Misserfolge auf äußere Umstände zu schieben, schützt unser Selbstbild, macht es aber schwer, aus Fehlern zu lernen.',
    counterMove: 'Frag dich: Welcher Teil dieses Ergebnisses lag bei mir, egal wie es ausgegangen ist?',
  },
  'zero-risk-bias': {
    name: 'Null-Risiko-Bias',
    definition: 'Lieber ein kleines Risiko ganz beseitigen, als ein großes Risiko stärker zu verringern.',
    scenario:
      'Eine Stadt kann entweder einen seltenen Schadstoff aus einem Brunnen entfernen, was die erwarteten Erkrankungen von 5 auf 0 senkt, oder einen häufigen Schadstoff im ganzen Stadtgebiet verringern, was die Erkrankungen von 50 auf 25 senkt. Viele Einwohner bevorzugen den ersten Plan.',
    options: ['Framing-Effekt', 'Null-Risiko-Bias', 'Status-quo-Verzerrung'],
    explanation:
      'Der zweite Plan verhindert 25 Erkrankungen statt 5, aber ein Risiko ganz auf null zu bringen, fühlt sich sicherer an.',
    counterMove: 'Vergleiche, wie viel Schaden insgesamt verhindert wird, nicht ob ein Risiko auf null sinkt.',
  },
  'forer-effect': {
    name: 'Barnum-Effekt',
    definition: 'Vage, allgemeine Beschreibungen für besonders treffend über uns selbst halten.',
    scenario:
      'Ein Online-Quiz sagt Mia: „Du hast viel ungenutztes Potenzial, und manchmal zweifelst du, ob du die richtige Entscheidung getroffen hast.“ Sie staunt, wie gut es sie kennt.',
    options: ['Bestätigungsfehler', 'Verzerrungsblindheit', 'Barnum-Effekt'],
    explanation:
      'Solche Aussagen passen auf fast alle Menschen. Sie fühlen sich persönlich an, ohne etwas Bestimmtes zu sagen.',
    counterMove: 'Frag dich: Würde diese Beschreibung auf die meisten Menschen passen, die ich kenne?',
  },
  'outcome-bias': {
    name: 'Ergebnisverzerrung',
    definition: 'Eine Entscheidung danach beurteilen, wie sie ausgegangen ist, statt danach, was man damals wusste.',
    scenario:
      'Johanna steckt auf den Tipp eines Freundes ihr gesamtes Erspartes in eine einzige riskante Aktie, und die verdreifacht sich. Ihre Freunde loben die Entscheidung als klug.',
    options: ['Ergebnisverzerrung', 'Survivorship Bias', 'Spielerfehlschluss'],
    explanation:
      'Das Ergebnis war gut, aber die Entscheidung war ein Glücksspiel, mit denselben Informationen in beiden Fällen. Auf schlechte Entscheidungen können gute Ergebnisse folgen, und umgekehrt.',
    counterMove: 'Frag dich: Würde das noch wie eine gute Entscheidung aussehen, wenn es schiefgegangen wäre?',
  },
  'illusory-truth-effect': {
    name: 'Wahrheitseffekt',
    definition: 'Eine Behauptung eher glauben, nachdem wir sie wiederholt gehört haben.',
    scenario:
      'Kai hat die Behauptung „Wir nutzen nur 10 % unseres Gehirns“ in mehreren Videos gesehen. Kai kennt keine Quelle dafür, aber inzwischen erscheint sie ganz offensichtlich richtig.',
    options: ['Verfügbarkeitsheuristik', 'Wahrheitseffekt', 'Autoritätsheuristik'],
    explanation:
      'Wiederholung macht eine Aussage vertraut, und Vertrautheit fühlt sich wie Wahrheit an. Die 10-%-Behauptung ist ein Mythos.',
    counterMove: 'Frag dich: Weiß ich, warum das stimmt, oder habe ich es nur oft gehört?',
  },
  'availability-heuristic-review': {
    name: 'Verfügbarkeitsheuristik',
    definition: 'Einschätzen, wie wahrscheinlich etwas ist, danach, wie leicht uns Beispiele einfallen.',
    scenario:
      'Nachdem Ines von einem Einbruch bei den Nachbarn gehört hat, schätzt sie Einbrüche in ihrer Gegend als viel häufiger ein, als die Polizeistatistik zeigt.',
    options: ['Ankereffekt', 'Ergebnisverzerrung', 'Verfügbarkeitsheuristik'],
    explanation:
      'Eine einzige anschauliche, frische Geschichte hat Einbrüche leicht vorstellbar gemacht, deshalb wirkten sie häufiger, als sie sind.',
    counterMove: 'Frag dich: Was sagen die tatsächlichen Zahlen, nicht die einprägsamen Beispiele?',
  },
  'bandwagon-effect': {
    name: 'Mitläufereffekt',
    definition: 'Eine Wahl oder Überzeugung übernehmen, weil viele andere es getan haben.',
    scenario:
      'Zwei Restaurants liegen nebeneinander. Vor dem einen steht eine lange Schlange, das andere ist leer. Nadine stellt sich in die Schlange, ohne die Speisekarte oder Bewertungen anzusehen.',
    options: ['Status-quo-Verzerrung', 'Halo-Effekt', 'Mitläufereffekt'],
    explanation:
      'Eine Menschenmenge kann ein nützliches Signal sein, aber sie kann auch nur bedeuten, dass andere ebenfalls der Menge gefolgt sind. Nadine hat sonst nichts geprüft.',
    counterMove: 'Frag dich: Was weiß ich darüber, außer wie viele Leute es gewählt haben?',
  },
  'spotlight-effect': {
    name: 'Spotlight-Effekt',
    definition: 'Überschätzen, wie sehr andere unser Aussehen und unsere Missgeschicke bemerken.',
    scenario:
      'Leon verschüttet vor einem Meeting Kaffee auf sein Hemd und ist die ganze Stunde überzeugt, dass alle auf den Fleck starren. Hinterher erinnert sich niemand daran.',
    options: ['Spotlight-Effekt', 'Fluch des Wissens', 'Negativitätseffekt'],
    explanation:
      'Wir stehen im Mittelpunkt unserer eigenen Aufmerksamkeit und nehmen an, dass wir auch im Mittelpunkt der Aufmerksamkeit anderer stehen. Studien zeigen, dass Menschen ungefähr doppelt so stark überschätzen, wie sehr sie auffallen.',
    counterMove: 'Frag dich: Wie sehr ist es mir aufgefallen, als das zuletzt jemand anderem passiert ist?',
  },
  'ikea-effect': {
    name: 'IKEA-Effekt',
    definition: 'Dinge höher schätzen, weil wir sie selbst gemacht haben.',
    scenario:
      'Nach zwei Stunden Aufbau eines leicht wackeligen Bücherregals schätzt Anna es mehr als ein stabileres aus dem Laden und würde es nicht für das verkaufen, was sie bezahlt hat.',
    options: ['Versunkene-Kosten-Falle', 'IKEA-Effekt', 'Status-quo-Verzerrung'],
    explanation:
      'Wenn wir etwas erfolgreich selbst bauen, steigt sein Wert für uns, über das hinaus, was es jemand anderem wert wäre.',
    counterMove: 'Frag dich: Würde ich das genauso schätzen, wenn jemand anderes es gemacht hätte?',
  },
  'conjunction-fallacy': {
    name: 'Konjunktionsfehler',
    definition: 'Eine bestimmte Kombination von Ereignissen für wahrscheinlicher halten als einen ihrer Teile.',
    scenario:
      'Was ist im nächsten Jahr wahrscheinlicher: „ein schweres Erdbeben in Italien“ oder „ein schweres Erdbeben in Italien, das eine Überschwemmung auslöst“? Viele Menschen wählen das zweite.',
    options: ['Verfügbarkeitsheuristik', 'Ankereffekt', 'Konjunktionsfehler'],
    explanation:
      'Jedes Erdbeben, das eine Überschwemmung auslöst, ist auch ein Erdbeben. Das zweite kann also nie wahrscheinlicher sein. Zusätzliche Details machen eine Geschichte anschaulicher, nicht wahrscheinlicher.',
    counterMove: 'Frag dich: Macht dieses zusätzliche Detail es wahrscheinlicher oder nur überzeugender?',
  },
  'negativity-bias': {
    name: 'Negativitätseffekt',
    definition: 'Schlechten Erfahrungen und Informationen mehr Gewicht geben als ebenso guten.',
    scenario:
      'Carla bekommt zu ihrem Vortrag zehn freundliche Kommentare und einen kritischen. Am Abend kann sie nur noch an die Kritik denken.',
    options: ['Negativitätseffekt', 'Spotlight-Effekt', 'Bestätigungsfehler'],
    explanation:
      'Negative Informationen ziehen mehr Aufmerksamkeit auf sich und wiegen schwerer. So kann eine Kritik zehn Komplimente aufwiegen.',
    counterMove: 'Frag dich: Wenn ich Gutes und Schlechtes gleich gewichte, wie sieht das Gesamtbild aus?',
  },
  'naive-realism': {
    name: 'Naiver Realismus',
    definition: 'Annehmen, dass wir die Welt sehen, wie sie wirklich ist, und wer anderer Meinung ist, schlecht informiert oder voreingenommen sein muss.',
    scenario:
      'Zwei Freunde sehen eine knappe Schiedsrichterentscheidung. Jeder ist sicher, dass seine Sicht einfach offensichtlich ist und der andere es nur anders sieht, weil er zur anderen Mannschaft hält.',
    options: ['Falscher Konsensus-Effekt', 'Naiver Realismus', 'Selbstwertdienliche Verzerrung'],
    explanation:
      'Jeder behandelt die eigene Sicht als schlichte Wirklichkeit und erklärt die des anderen weg. Unsere eigene Perspektive bemerken wir selten als Perspektive.',
    counterMove: 'Frag dich: Was müsste ein vernünftiger Mensch glauben, um es andersherum zu sehen?',
  },
  'framing-effect-review': {
    name: 'Framing-Effekt',
    definition: 'Auf dieselbe Information unterschiedlich reagieren, je nachdem, wie sie dargestellt wird.',
    scenario:
      'Kundinnen und Kunden greifen lieber zu Rinderhack mit der Aufschrift „75 % mager“ als zu demselben Hack mit der Aufschrift „25 % Fett“.',
    options: ['Framing-Effekt', 'Halo-Effekt', 'Ankereffekt'],
    explanation:
      'Beide Aufschriften beschreiben dasselbe Fleisch. Es nach dem Guten statt nach dem Schlechten zu beschreiben, hat die Wahl verändert.',
    counterMove: 'Formuliere die Wahl andersherum und prüfe, ob sich deine Antwort ändert.',
  },
  'clustering-illusion': {
    name: 'Clustering-Illusion',
    definition: 'In zufälligen Serien bedeutungsvolle Muster sehen.',
    scenario:
      'Emmas Playlist läuft im Zufallsmodus und spielt drei Lieder derselben Künstlerin hintereinander. Sie beschließt, dass der Zufallsmodus nicht wirklich zufällig ist.',
    options: ['Spielerfehlschluss', 'Bestätigungsfehler', 'Clustering-Illusion'],
    explanation:
      'Zufallsfolgen erzeugen häufiger Serien, als wir erwarten. Ein echter Zufallsmodus wirkt oft weniger zufällig als einer, der Wiederholungen absichtlich vermeidet.',
    counterMove: 'Frag dich: Wie oft würde das rein zufällig passieren?',
  },
  reactance: {
    name: 'Reaktanz',
    definition: 'Uns gegen eine Aufforderung sträuben, weil sie sich wie eine Bedrohung unserer Freiheit anfühlt.',
    scenario:
      'Ein Schild sagt: „Ab hier absolut keine Handys.“ Ben, der sein Handy gar nicht benutzen wollte, verspürt plötzlich den starken Drang, draufzuschauen.',
    options: ['Reaktanz', 'Status-quo-Verzerrung', 'Mitläufereffekt'],
    explanation:
      'Wenn man uns sagt, dass wir etwas nicht dürfen, kann es reizvoller werden, als Weg, uns die Freiheit der Wahl zurückzuholen.',
    counterMove: 'Frag dich: Will ich das wirklich, oder mag ich nur kein Nein?',
  },
  'third-person-effect': {
    name: 'Third-Person-Effekt',
    definition: 'Glauben, dass Medienbotschaften andere stärker beeinflussen als uns selbst.',
    scenario:
      'Nach einer Welle schicker Werbung für einen neuen Energydrink sagt Tom, seine Freunde würden von der Werbung manipuliert, aber auf ihn habe sie keine Wirkung.',
    options: ['Halo-Effekt', 'Third-Person-Effekt', 'Reaktanz'],
    explanation:
      'Wir halten andere meist für leichter beeinflussbar als uns selbst. Dadurch sind wir gegenüber denselben Botschaften weniger auf der Hut.',
    counterMove: 'Frag dich: Wenn diese Werbung bei anderen wirkt, warum sollte sie bei mir nicht wirken?',
  },
  'false-memory': {
    name: 'Falsche Erinnerung',
    definition: 'Sich sicher an Ereignisse erinnern, die nie passiert sind oder anders passiert sind.',
    scenario:
      'Jahre später wissen zwei Geschwister beide noch lebhaft, dass sie es waren, die den entlaufenen Familienhund gefunden haben. Nur eines von beiden kann recht haben.',
    options: ['Rückschaufehler', 'Selbstwertdienliche Verzerrung', 'Falsche Erinnerung'],
    explanation:
      'Erinnerungen werden bei jedem Abrufen neu zusammengesetzt. Deshalb kann auch eine lebhafte, sichere Erinnerung falsch sein.',
    counterMove: 'Frag dich: Gibt es eine Aufzeichnung, mit der sich diese Erinnerung überprüfen lässt?',
  },
  suggestibility: {
    name: 'Suggestibilität',
    definition: 'Suggestivfragen oder spätere Informationen verändern lassen, woran wir uns erinnern.',
    scenario:
      'Nach einem Video von einem Autounfall erinnern sich Menschen, die gefragt werden „Wie schnell fuhren die Autos, als sie ineinanderkrachten?“, an höhere Geschwindigkeiten, und manche erinnern sich an Glasscherben, die es nie gab.',
    options: ['Suggestibilität', 'Fluch des Wissens', 'Status-quo-Verzerrung'],
    explanation:
      'Das Wort „ineinanderkrachten“ hat die Erinnerung selbst verändert, nicht nur die Antwort. Was wir später hören, kann still umschreiben, was wir gesehen zu haben glauben.',
    counterMove: 'Frag dich: Könnte die Art, wie ich gefragt wurde, meine Erinnerung geprägt haben?',
  },
  'in-group-favoritism': {
    name: 'Eigengruppenfavorisierung',
    definition: 'Menschen aus unserer eigenen Gruppe bevorzugen, selbst wenn die Gruppen willkürlich sind.',
    scenario:
      'Freiwillige werden per Münzwurf in zwei Teams aufgeteilt. Sollen sie eine Prämie verteilen, geben die meisten ihrem eigenen Team mehr, obwohl sie niemanden aus beiden Teams je getroffen haben.',
    options: ['Mitläufereffekt', 'Eigengruppenfavorisierung', 'Falscher Konsensus-Effekt'],
    explanation:
      'Ein per Münzwurf zugeteiltes Team hat gereicht, damit Menschen „uns“ gegenüber „denen“ bevorzugen.',
    counterMove: 'Frag dich: Würde ich genauso entscheiden, wenn diese Person im anderen Team wäre?',
  },
  'survivorship-bias-review': {
    name: 'Survivorship Bias',
    definition: 'Schlüsse nur aus den Fällen ziehen, die es geschafft haben.',
    scenario:
      'Ein Altbau-Fan sagt, vor hundert Jahren habe man besser gebaut, und zeigt auf die soliden alten Häuser, die in der Stadt noch stehen.',
    options: ['Rückschaufehler', 'Survivorship Bias', 'Halo-Effekt'],
    explanation:
      'Die schlecht gebauten Häuser aus dieser Zeit sind größtenteils abgerissen. Übrig und sichtbar sind nur die besten.',
    counterMove: 'Frag dich: Wer hat dasselbe versucht und ist gescheitert, und warum sehe ich diese Leute nicht?',
  },
};
