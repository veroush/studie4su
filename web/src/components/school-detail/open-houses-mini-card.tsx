import { Link } from '@tanstack/react-router'

interface OpenHousesMiniCardProps {
  openHouse: {
    id: string
    title: string
    date: string
    imageUrl?: string | null
  }
}

export function OpenHousesMiniCard({ openHouse }: OpenHousesMiniCardProps) {
  return (
    <div>
      {openHouse.imageUrl && <img src={openHouse.imageUrl} alt="" />}
      <h3>{openHouse.title}</h3>
      <p>{new Date(openHouse.date).toLocaleDateString('nl-NL')}</p>
      <Link to="/open-houses">Aanmelden</Link>
    </div>
  )
}
