import { Button } from "$SHADCN_COMPONENT_LIBRARY_PACKAGE"

export default function SignInWithEmailPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-[350px]">
        <Button variant="default" size="default" shape="default" className="w-full">
          Sign in with Email
        </Button>
      </div>
    </main>
  )
}
