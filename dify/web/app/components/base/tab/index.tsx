import type { CSSProperties } from 'react'
import React from 'react'
import { type VariantProps, cva } from 'class-variance-authority'
import classNames from '@/utils/classnames'

// Dodajemy size do konfiguracji
const tabVariants = cva('tab', {
  variants: {
    active: {
      true: 'tab-active',
      false: 'tab-inactive',
    },
    size: {
      small: 'tab-small',
      medium: 'tab-medium',
      large: 'tab-large',
    },
    disabled: {
      true: 'tab-disabled',
      false: '',
    },
  },
  defaultVariants: {
    active: false,
    size: 'medium',
    disabled: false,
  },
})

export type NavbarTabProps = {
  active?: boolean
  disabled?: boolean
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void
  styleCss?: CSSProperties
  children: React.ReactNode
} & React.HTMLAttributes<HTMLDivElement> &
VariantProps<typeof tabVariants>

const NavbarTab = React.forwardRef<HTMLDivElement, NavbarTabProps>(
  (
    {
      active = false,
      disabled = false,
      size = 'medium', // Dodajemy size z domyślną wartością
      onClick,
      className,
      children,
      styleCss,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        className={classNames(
          tabVariants({ active, size, disabled }),
          className,
        )}
        ref={ref}
        style={styleCss}
        onClick={disabled ? undefined : onClick}
        {...props}
      >
        {children}
      </div>
    )
  },
)

NavbarTab.displayName = 'NavbarTab'

export default NavbarTab
export { NavbarTab, tabVariants }
