import { useUsers } from '../hooks/useUsers'

interface User {
  id: number
  name: string
  email: string
}

export default function UsersPage() {
  const { data: users, isLoading, isError } = useUsers()

  if (isLoading) return <p>Chargement...</p>
  if (isError) return <p>Erreur.</p>

  return (
    <ul>
      {users?.map((user: User) => (
        <li key={user.id}>{user.name} — {user.email}</li>
      ))}
    </ul>
  )
}