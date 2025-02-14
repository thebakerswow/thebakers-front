import { ComponentProps, ReactNode } from 'react'
import { tv, VariantProps } from 'tailwind-variants'

const buttonVariants = tv({
  base: 'flex items-center gap-2 font-medium transform transition-all duration-200 ',
  variants: {
    variant: {
      home: 'text-3xl',
      header: 'text-gray-300 hover:bg-zinc-800 rounded-xl p-2 px-8',
      submit: 'bg-red-400 text-gray-100 hover:bg-red-500 shadow-lg rounded-md',
      pagination:
        'bg-zinc-100 text-gray-700 hover:bg-gray-400 disabled:opacity-50 rounded-md',
    },
    size: {
      default: '',
      pagination: 'px-4 py-2',
      reset: 'p-1 text-sm font-normal px-2',
    },
  },
})

interface ButtonProps
  extends ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  children: ReactNode
  variant: 'submit' | 'pagination' | 'header' | 'home'
}

export function Button({ children, variant, size, ...props }: ButtonProps) {
  return (
    <button {...props} className={buttonVariants({ variant, size })}>
      {children}
    </button>
  )
}
