import { Link } from '@tanstack/react-router'

export function QuizBanner() {
  return (
    <section>
      <div>
        <h2>Weet je nog niet wat je wil studeren?</h2>
        <p>Doe de gratis studiequiz en ontdek welke richting bij je past.</p>
      </div>
      <Link to="/quiz">Start de Quiz</Link>
    </section>
  )
}
