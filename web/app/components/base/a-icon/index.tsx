import React from 'react'
import classNames from '@/utils/classnames'

export type AiconProps = {
  size?: number
  color?: string
  icon: string
  className?: string
} & React.SVGProps<SVGSVGElement>

const Aicon = React.forwardRef<SVGSVGElement, AiconProps>(
  ({ size = 24, color = '#000000', icon, className, ...props }, ref) => {
    const renderIcon = () => {
      if (icon === 'icon-left') {
        return (
          <svg
            className={classNames('a-icon', className)}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            ref={ref}
            {...props}
          >
            <path
              d="M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41Z"
              fill={color}
            />
          </svg>
        )
      }
      else if (icon === 'icon-right') {
        return (
          <svg
            className={classNames('a-icon', className)}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            ref={ref}
            {...props}
          >
            <path
              d="M7.99991 16.59L9.40991 18L15.4099 12L9.40991 6L7.99991 7.41L12.5799 12L7.99991 16.59Z"
              fill={color}
            />
          </svg>
        )
      }
      else if (icon === 'icon-down') {
        return (
          <svg
            className={classNames('a-icon', className)}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            ref={ref}
            {...props}
          >
            <path
              d="M7.41 8.00016L6 9.41016L12 15.4102L18 9.41016L16.59 8.00016L12 12.5802L7.41 8.00016Z"
              fill={color}
            />
          </svg>
        )
      }
      else if (icon === 'icon-top') {
        return (
          <svg
            className={classNames('a-icon', className)}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            ref={ref}
            {...props}
          >
            <path
              d="M16.59 15.9998L18 14.5898L12 8.58984L6 14.5898L7.41 15.9998L12 11.4198L16.59 15.9998Z"
              fill={color}
            />
          </svg>
        )
      }
      else if (icon === 'icon-copy-line') {
        return (
          <svg
            className={classNames('a-icon', className)}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            ref={ref}
            {...props}
          >
            <path
              d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM15 5H8C6.9 5 6.01 5.9 6.01 7L6 21C6 22.1 6.89 23 7.99 23H19C20.1 23 21 22.1 21 21V11L15 5ZM8 21V7H14V12H19V21H8Z"
              fill={color}
            />
          </svg>
        )
      }
      else if (icon === 'icon-copy-fill') {
        return (
          <svg
            className={classNames('a-icon', className)}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            ref={ref}
            {...props}
          >
            <path
              d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM15 5L21 11V21C21 22.1 20.1 23 19 23H7.99C6.89 23 6 22.1 6 21L6.01 7C6.01 5.9 6.9 5 8 5H15ZM14 12H19.5L14 6.5V12Z"
              fill={color}
            />
          </svg>
        )
      }
      else if (icon === 'icon-add') {
        return (
          <svg
            className={classNames('a-icon', className)}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            ref={ref}
            {...props}
          >
            <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill={color} />
          </svg>
        )
      }
      else if (icon === 'icon-arrow-right') {
        return (
          <svg
            className={classNames('a-icon', className)}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            ref={ref}
            {...props}
          >
            <path
              d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z"
              fill={color}
            />
          </svg>
        )
      }
      else if (icon === 'icon-arrow-left') {
        return (
          <svg
            className={classNames('a-icon', className)}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            ref={ref}
            {...props}
          >
            <path
              d="M12 4L13.41 5.41L7.83 11H20V13H7.83L13.41 18.59L12 20L4 12L12 4Z"
              fill={color}
            />
          </svg>
        )
      }
      else if (icon === 'icon-arrow-top') {
        return (
          <svg
            className={classNames('a-icon', className)}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            ref={ref}
            {...props}
          >
            <path
              d="M20 12L18.59 13.41L13 7.83L13 20L11 20L11 7.83L5.41 13.41L4 12L12 4L20 12Z"
              fill={color}
            />
          </svg>
        )
      }
      else if (icon === 'icon-arrow-top') {
        return (
          <svg
            className={classNames('a-icon', className)}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            ref={ref}
            {...props}
          >
            <path
              d="M4 12L5.41 10.59L11 16.17L11 4L13 4L13 16.17L18.59 10.59L20 12L12 20L4 12Z"
              fill={color}
            />
          </svg>
        )
      }
      else if (icon === 'icon-grid') {
        return (
          <svg
            className={classNames('a-icon', className)}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            ref={ref}
            {...props}
          >
            <path
              d="M3 3V21H21V3H3ZM11 19H5V13H11V19ZM11 11H5V5H11V11ZM19 19H13V13H19V19ZM19 11H13V5H19V11Z"
              fill={color}
            />
          </svg>
        )
      }
      else {
        // W przypadku, gdy ikona nie jest obsługiwana
        return null
      }
    }

    return renderIcon()
  },
)

Aicon.displayName = 'Aicon'

export default Aicon
