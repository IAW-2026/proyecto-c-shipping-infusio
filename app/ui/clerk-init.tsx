import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'

export default function ClerkInit(){
    return (
        <div>   
            <Show when="signed-out">
                <SignInButton>
                    <button className="bg-primary text-primary-foreground rounded-full font-medium text-sm h-10 px-6 cursor-pointer hover:opacity-90 transition-opacity border border-primary">
                        Iniciar sesión
                    </button>
                </SignInButton>
                <SignUpButton>
                    <button className="bg-secondary text-secondary-foreground rounded-full font-medium text-sm h-10 px-6 cursor-pointer hover:opacity-90 transition-opacity border border-secondary ml-2">
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