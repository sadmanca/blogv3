\version "2.26.0"

\header {
  title = "He's a Pirate"
  composer = "Hans Zimmer"
  tagline = ##f
}

\score {
  \new TabStaff \with {
    stringTunings = \stringTuning <a' e' c' g'>
  } {
    \time 4/4
    \tempo 4 = 90
    g'4\1 e'4\3 fis'4\3 fis'4\3 | fis'4\3 c'4\2 cis'4\2 cis'4\2 | r4 cis'4\2 a'4\4 c'4\2 | c'4\2 fis'4\3 e'4\3 fis'4\3 | g'4\1 e'4\3 fis'4\3 fis'4\3 | fis'4\3 c'4\2 cis'4\2 cis'4\2 | cis'4\2 a'4\4 c'4\2 c'4\2 | fis'4\3 e'4\3 fis'4\3 g'4\1 | e'4\3 fis'4\3 fis'4\3 fis'4\3 | cis'4\2 a'4\4 a'4\4 a'4\4 | g'4\1 gis'4\1 gis'4\1 g'4\1 | a'4\4 g'4\1 fis'4\3 r4 | fis'4\3 c'4\2 r4 cis'4\2 | cis'4\2 a'4\4 r4 g'4\1 | fis'4\3 r4 fis'4\3 cis'4\2 | r4 c'4\2 c'4\2 r4 | cis'4\2 fis'4\3 c'4\2 r4 | g'4\1 e'4\3 fis'4\3 fis'4\3 | fis'4\3 c'4\2 cis'4\2 cis'4\2 | a'4\4 c'4\2 c'4\2 fis'4\3 | e'4\3 fis'4\3 r4 fis'4\3 | fis'4\3 fis'4\3 cis'4\2 a'4\4 | a'4\4 a'4\4 g'4\1 gis'4\1 | gis'4\1 g'4\1 a'4\4 g'4\1 | fis'4\3 r4 fis'4\3 c'4\2 | r4 cis'4\2 cis'4\2 a'4\4 | r4 g'4\1 fis'4\3 r4 | fis'4\3 cis'4\2 c'4\2 c'4\2 | fis'4\3 f'4\3 fis'4\3 c'4\2 | r4 cis'4\2 cis'4\2 a'4\4 | g'4\1 cis'4\2 fis'4\3 g'4\1 | r4 gis'4\1 cis'4\2 fis'4\3 | gis'4\1 r4 c'4\2 cis'4\2 | g'4\1 r4 a'4\4 a'4\4 | g'4\1 g'4\1 g'4\1 gis'4\1 | g'4\1 r4 a'4\4 a'4\4 | a'4\4 g'4\1 g'4\1 r4 | g'4\1 g'4\1 g'4\1 gis'4\1 | g'4\1 a'4\4 cis'4\2 c'4\2 | fis'4\3 r4 fis'4\3 c'4\2 | cis'4\2 a'4\4 g'4\1 a'4\4 | cis'4\2 c'4\2 cis'4\2 a'4\4 | g'4\1 a'4\4 cis'4\2 a'4\4 | g'4\1 a'4\4 cis'4\2 c'4\2 | cis'4\2 c'4\2 fis'4\3 e'4\3 | fis'4\3 r4 fis'4\3 c'4\2 | cis'4\2 r4 c'4\2 cis'4\2 | a'4\4 cis'4\2 a'4\4 g'4\1 | a'4\4 cis'4\2 r4 fis'4\3 | fis'4\3 c'4\2 cis'4\2 a'4\4 | g'4\1 r4 gis'4\1 fis'4\3 | a'4\4 cis'4\2 a'4\4 c'4\2 | r4 fis'4\3 c'4\2 f'4\3 | g'4\1 r4 gis'4\1 r4 | g'4\1 g'4\1 g'4\1 r4 | g'4\1 a'4\4 r4 a'4\4 | r4 cis'4\2 r4 c'4\2 | cis'4\2 c'4\2 c'4\2 c'4\2 | fis'4\3 r4 fis'4\3 c'4\2 | cis'4\2 g'4\1 r4 fis'4\3 | c'4\2 cis'4\2 gis'4\1 gis'4\1 | r4 fis'4\3 c'4\2 cis'4\2 | g'4\1 r4 g'4\1 e'4\3 | g'4\1 g'4\1 r4 a'4\4 | r4 a'4\4 r4 cis'4\2 | r4 c'4\2 cis'4\2 c'4\2 | r4 fis'4\3
  }
  \layout {
    \context {
      \TabVoice
      \omit StringNumber
    }
  }
}
