\version "2.26.0"

\header {
  title = "Twinkle Twinkle Little Star"
  composer = "Traditional"
  tagline = ##f
}

\score {
  \new TabStaff {
    \set TabStaff.stringTunings = #ukulele-tuning
    \relative c' {
      c4 c g g a a g2 |
      f4 f e e d d c2 |
    }
  }
  \layout {}
}
