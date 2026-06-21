import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'

export default function ClerkInit(){
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Show when="signed-out">
                <SignInButton>
                    <button className="w-full rounded-full border border-primary bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto h-10 cursor-pointer">
                        Iniciar sesión
                    </button>
                </SignInButton>
                <SignUpButton>
                    <button className="w-full rounded-full border border-secondary bg-secondary px-6 text-sm font-medium text-secondary-foreground transition-opacity hover:opacity-90 sm:w-auto h-10 cursor-pointer sm:ml-2">
                        Crear cuenta
                    </button>
                </SignUpButton>
            </Show>
            <Show when="signed-in">
                <UserButton />
            </Show>
        </div>
    )
}