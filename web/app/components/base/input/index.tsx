import type { CSSProperties } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  RiErrorWarningLine,
} from '@remixicon/react'
import { type VariantProps, cva } from 'class-variance-authority'
import Aicon from '../a-icon'
import Button from '../button'
import cn from '@/utils/classnames'

export const inputVariants = cva('', {
  variants: {
    size: {
      regular:
        'px-3 py-2 rounded-[8px] text-sm leading-5 font-normal transition duration-300 ease-out',
      large:
        'px-3 p-y3 rounded-[12px] text-base leading-6 font-normal transition duration-300 ease-out',
    },
  },
  defaultVariants: {
    size: 'regular',
  },
})

export type InputProps = {
  showLeftIcon?: boolean
  showClearIcon?: boolean
  onClear?: () => void
  disabled?: boolean
  destructive?: boolean
  wrapperClassName?: string
  styleCss?: CSSProperties
} & React.InputHTMLAttributes<HTMLInputElement> &
VariantProps<typeof inputVariants>

const Input = ({
  size,
  disabled,
  destructive,
  showLeftIcon,
  showClearIcon,
  onClear,
  wrapperClassName,
  className,
  styleCss,
  value,
  placeholder,
  onChange,
  ...props
}: InputProps) => {
  const iconSize = size === 'large' ? 24 : 20
  const iconSearchPos = size === 'large' ? 'left-3' : 'left-2'
  const iconClearPos = size === 'large' ? 'right-3' : 'right-2'
  const py = size === 'large' ? 'py-3' : 'p-2'
  const { t } = useTranslation()
  return (
    <div className={cn('relative w-full', wrapperClassName)}>
      {showLeftIcon && (
        <Aicon
          size={iconSize}
          color="var(--color-basic-black)"
          icon="icon-search"
          className={`absolute ${iconSearchPos} top-1/2 -translate-y-1/2`}
        />
      )}
      <input
        style={styleCss}
        className={cn(
          `w-full ${py} bg-components-input-bg-normal border border-transparent text-components-input-text-filled hover:bg-components-input-bg-hover hover:border-components-input-border-hover focus:bg-components-input-bg-active focus:border-components-input-border-active focus:shadow-xs placeholder:text-components-input-text-placeholder appearance-none outline-none caret-primary-600`,
          inputVariants({ size }),
          showLeftIcon && 'pl-8',
          showLeftIcon && size === 'large' && 'pl-12',
          showClearIcon && value && 'pr-8',
          showClearIcon && value && size === 'large' && 'pr-12',
          destructive && 'pr-8',
          destructive && size === 'large' && 'pr-12',
          disabled
            && 'bg-components-input-bg-disabled border-transparent text-components-input-text-filled-disabled cursor-not-allowed hover:bg-components-input-bg-disabled hover:border-transparent',
          destructive
            && 'bg-components-input-bg-destructive border-components-input-border-destructive text-components-input-text-filled hover:bg-components-input-bg-destructive hover:border-components-input-border-destructive focus:bg-components-input-bg-destructive focus:border-components-input-border-destructive',
          className,
        )}
        placeholder={
          placeholder
          ?? (showLeftIcon
            ? t('common.operation.search') ?? ''
            : t('common.placeholder.input'))
        }
        value={value}
        onChange={onChange}
        disabled={disabled}
        {...props}
      />
      {showClearIcon && value && !disabled && !destructive && (
        <Button
          size="medium"
          variant="tertiary"
          onClick={onClear}
          className={`absolute ${iconClearPos} top-1/2 -translate-y-1/2 btn-icon-rotate`}
        >
          <Aicon size={iconSize} icon="icon-cancel" className={'a-icon--btn'} />
        </Button>
      )}
      {destructive && (
        <RiErrorWarningLine className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-destructive-secondary" />
      )}
    </div>
  )
}

export default Input
