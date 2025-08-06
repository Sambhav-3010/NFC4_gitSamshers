import Link from "next/link";

export default function RejectPage() {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold text-red-600">Submission Failed</h1>
      <Link href="/verify-land" className="text-blue-500 underline">
        Go back to verification
      </Link>
    </div>
  )
}