import { redirect } from "next/navigation"

export default function IndexPage() {
  redirect("/dashboard")
  return null
}
