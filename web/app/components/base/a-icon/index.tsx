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
      else if (icon === 'icon-search') {
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
              d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14V14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z"
              fill={color}
            />
          </svg>
        )
      }
      else if (icon === 'icon-cancel') {
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
              d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
              fill={color}
            />
          </svg>
        )
      }
      else if (icon === 'icon-tag') {
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
              d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7V17C3 18.1 3.9 18.99 5 18.99L16 19C16.67 19 17.27 18.67 17.63 18.16L22 12L17.63 5.84ZM16 17H5V7H16L19.55 12L16 17Z"
              fill={color}
            />
          </svg>
        )
      }
      else if (icon === 'icon-env') {
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
              d="M20 18C20 18.2652 19.8946 18.5196 19.7071 18.7071C19.5196 18.8946 19.2652 19 19 19H15C14.2044 19 13.4413 19.3161 12.8787 19.8787C12.3161 20.4413 12 21.2044 12 22C12 21.2044 11.6839 20.4413 11.1213 19.8787C10.5587 19.3161 9.79565 19 9 19H5C4.73478 19 4.48043 18.8946 4.29289 18.7071C4.10536 18.5196 4 18.2652 4 18H2C2 18.7956 2.31607 19.5587 2.87868 20.1213C3.44129 20.6839 4.20435 21 5 21H9C9.53043 21 10.0391 21.2107 10.4142 21.5858C10.7893 21.9609 11 22.4696 11 23H13C13 22.4696 13.2107 21.9609 13.5858 21.5858C13.9609 21.2107 14.4696 21 15 21H19C19.7956 21 20.5587 20.6839 21.1213 20.1213C21.6839 19.5587 22 18.7956 22 18H20ZM20 6C20 5.73478 19.8946 5.48043 19.7071 5.29289C19.5196 5.10536 19.2652 5 19 5H15C14.2044 5 13.4413 4.68393 12.8787 4.12132C12.3161 3.55871 12 2.79565 12 2C12 2.79565 11.6839 3.55871 11.1213 4.12132C10.5587 4.68393 9.79565 5 9 5H5C4.73478 5 4.48043 5.10536 4.29289 5.29289C4.10536 5.48043 4 5.73478 4 6H2C2 5.20435 2.31607 4.44129 2.87868 3.87868C3.44129 3.31607 4.20435 3 5 3H9C9.53043 3 10.0391 2.78929 10.4142 2.41421C10.7893 2.03914 11 1.53043 11 1H13C13 1.53043 13.2107 2.03914 13.5858 2.41421C13.9609 2.78929 14.4696 3 15 3H19C19.7956 3 20.5587 3.31607 21.1213 3.87868C21.6839 4.44129 22 5.20435 22 6H20ZM12 12L9 8H7V16H9V12L12 16H14V8H12V12ZM21 8L19 13.27L17 8H15L18 16H20L23 8H21ZM1 8V16H6V14H3V13H5V11H3V10H6V8H1Z"
              fill={color}
            />
          </svg>
        )
      }
      else if (icon === 'icon-play') {
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
            <path d="M8 5V19L19 12L8 5Z" fill={color} />
          </svg>
        )
      }
      else if (icon === 'icon-play-history') {
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
              d="M10 16L16 12L10 8V16ZM12 22C10.6167 22 9.31667 21.7373 8.1 21.212C6.88333 20.6867 5.825 19.9743 4.925 19.075C4.025 18.1757 3.31267 17.1173 2.788 15.9C2.26333 14.6827 2.00067 13.3827 2 12C2 11.2833 2.075 10.579 2.225 9.887C2.375 9.195 2.59167 8.52433 2.875 7.875L4.425 9.425C4.29167 9.85833 4.18767 10.2873 4.113 10.712C4.03833 11.1367 4.00067 11.566 4 12C4 14.2333 4.775 16.125 6.325 17.675C7.875 19.225 9.76667 20 12 20C14.2333 20 16.125 19.225 17.675 17.675C19.225 16.125 20 14.2333 20 12C20 9.76667 19.225 7.875 17.675 6.325C16.125 4.775 14.2333 4 12 4C11.55 4 11.1127 4.03733 10.688 4.112C10.2633 4.18667 9.84233 4.291 9.425 4.425L7.9 2.9C8.56667 2.6 9.23333 2.375 9.9 2.225C10.5667 2.075 11.2667 2 12 2C13.3833 2 14.6833 2.26233 15.9 2.787C17.1167 3.31167 18.175 4.02433 19.075 4.925C19.975 5.82567 20.6877 6.884 21.213 8.1C21.7383 9.316 22.0007 10.616 22 12C21.9993 13.384 21.7367 14.684 21.212 15.9C20.6873 17.116 19.975 18.1743 19.075 19.075C18.175 19.9757 17.1167 20.6883 15.9 21.213C14.6833 21.7377 13.3833 22 12 22ZM5.5 7C5.08333 7 4.72933 6.85433 4.438 6.563C4.14667 6.27167 4.00067 5.91733 4 5.5C3.99933 5.08267 4.14533 4.72867 4.438 4.438C4.73067 4.14733 5.08467 4.00133 5.5 4C5.91533 3.99867 6.26967 4.14467 6.563 4.438C6.85633 4.73133 7.002 5.08533 7 5.5C6.998 5.91467 6.85233 6.269 6.563 6.563C6.27367 6.857 5.91933 7.00267 5.5 7Z"
              fill={color}
            />
          </svg>
        )
      }
      else if (icon === 'icon-checklist') {
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
              d="M14 10H2V12H14V10ZM14 6H2V8H14V6ZM2 16H10V14H2V16ZM21.5 11.5L23 13L16.01 20L11.5 15.5L13 14L16.01 17L21.5 11.5Z"
              fill={color}
            />
          </svg>
        )
      }
      else if (icon === 'icon-features') {
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
              d="M6 15C7.1 15 8 15.9 8 17C8 18.1 7.1 19 6 19C4.9 19 4 18.1 4 17C4 15.9 4.9 15 6 15ZM6 13C3.8 13 2 14.8 2 17C2 19.2 3.8 21 6 21C8.2 21 10 19.2 10 17C10 14.8 8.2 13 6 13ZM12 5C13.1 5 14 5.9 14 7C14 8.1 13.1 9 12 9C10.9 9 10 8.1 10 7C10 5.9 10.9 5 12 5ZM12 3C9.8 3 8 4.8 8 7C8 9.2 9.8 11 12 11C14.2 11 16 9.2 16 7C16 4.8 14.2 3 12 3ZM18 15C19.1 15 20 15.9 20 17C20 18.1 19.1 19 18 19C16.9 19 16 18.1 16 17C16 15.9 16.9 15 18 15ZM18 13C15.8 13 14 14.8 14 17C14 19.2 15.8 21 18 21C20.2 21 22 19.2 22 17C22 14.8 20.2 13 18 13Z"
              fill={color}
            />
          </svg>
        )
      }
      else if (icon === 'icon-upload') {
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
              d="M5 4V6H19V4H5ZM5 14H9V20H15V14H19L12 7L5 14Z"
              fill={color}
            />
          </svg>
        )
      }
      else if (icon === 'icon-organize') {
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
              d="M20 3H4C3.4 3 3 3.4 3 4V20C3 20.6 3.4 21 4 21H20C20.6 21 21 20.6 21 20V4C21 3.4 20.6 3 20 3ZM19 19H5V5H19V19ZM12 13C12.6 13 13 12.6 13 12C13 11.4 12.6 11 12 11C11.4 11 11 11.4 11 12C11 12.6 11.4 13 12 13ZM12 17C12.6 17 13 16.6 13 16C13 15.4 12.6 15 12 15C11.4 15 11 15.4 11 16C11 16.6 11.4 17 12 17ZM12 9C12.6 9 13 8.6 13 8C13 7.4 12.6 7 12 7C11.4 7 11 7.4 11 8C11 8.6 11.4 9 12 9ZM8 13C8.6 13 9 12.6 9 12C9 11.4 8.6 11 8 11C7.4 11 7 11.4 7 12C7 12.6 7.4 13 8 13ZM16 13C16.6 13 17 12.6 17 12C17 11.4 16.6 11 16 11C15.4 11 15 11.4 15 12C15 12.6 15.4 13 16 13Z"
              fill={color}
            />
          </svg>
        )
      }
      else if (icon === 'icon-hand') {
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
              d="M19.995 16.5695V6.43709C19.995 5.37748 19.1108 4.54967 18.0371 4.54967C17.8476 4.54967 17.6581 4.58278 17.5002 4.61589V4.21854C17.5002 3.15894 16.616 2.33113 15.5423 2.33113C15.1634 2.33113 14.7844 2.43046 14.5002 2.62914C14.1528 2.23179 13.616 2 13.0475 2C12.2265 2 11.5001 2.49669 11.2159 3.19205C10.9949 3.09272 10.7738 3.0596 10.5212 3.0596C9.44747 3.0596 8.56324 3.92053 8.56324 4.94702V12.0993L8.15271 11.5695C7.42638 10.5762 6.10004 10.245 5.05791 10.8411C4.55264 11.1391 4.17369 11.6358 4.04737 12.2318C3.92105 12.8278 4.04737 13.457 4.42632 13.9868L7.26848 17.9272C7.42638 18.1258 7.5527 18.3576 7.71059 18.5563C8.15271 19.2185 8.6264 19.947 9.28957 20.5099C10.5528 21.6026 12.258 22 13.8686 22C14.6581 22 15.3844 21.9007 16.0792 21.7682C20.0266 20.8742 20.0266 17.7616 19.995 16.5695ZM15.7634 20.3113C14.1212 20.6755 11.658 20.6755 10.2054 19.3841C9.7001 18.9205 9.28957 18.3245 8.87904 17.6954L8.40534 17L5.56319 13.0596C5.43687 12.894 5.40529 12.6954 5.43687 12.5298C5.46845 12.3642 5.56319 12.2318 5.72108 12.1325C6.13162 11.9007 6.73163 12.0662 7.01584 12.4636L7.04742 12.4967L8.75272 14.6159C8.9422 14.8477 9.25799 14.947 9.54221 14.8477C9.82642 14.7483 10.0159 14.4503 10.0159 14.1523V4.94702C10.0159 4.74834 10.2685 4.54967 10.5528 4.54967C10.837 4.54967 11.0896 4.74834 11.0896 4.94702V10.7748C11.0896 11.1722 11.4054 11.5364 11.8159 11.5364C12.2265 11.5364 12.5107 11.2053 12.5107 10.7748V3.8543C12.5107 3.62252 12.7633 3.45695 13.0475 3.45695C13.3317 3.45695 13.5844 3.65563 13.5844 3.88742V11.0397C13.5844 11.4371 13.9002 11.8013 14.3107 11.8013C14.7212 11.8013 15.037 11.4702 15.037 11.0397V4.21854C15.037 4.01987 15.2897 3.82119 15.5739 3.82119C15.8581 3.82119 16.1107 4.01987 16.1107 4.21854V11.702C16.1107 12.0993 16.4265 12.4636 16.8371 12.4636C17.2476 12.4636 17.5634 12.1325 17.5634 11.702V6.40397C17.595 6.2053 17.816 6.03974 18.1003 6.03974C18.3845 6.03974 18.6371 6.23841 18.6371 6.43709V16.6026C18.6055 18.0927 18.3845 19.7152 15.7634 20.3113Z"
              fill={color}
            />
          </svg>
        )
      }
      else if (icon === 'icon-coursor') {
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
              d="M7.82956 6.62969L18.2311 10.9784L14.6956 12.3502L13.8683 12.6684L13.5501 13.4957L12.1783 17.0312L7.82956 6.62969ZM4.10311 2.90324L11.7328 21.1395L12.7369 21.1395L15.4168 14.217L22.3394 11.537V10.5329L4.10311 2.90324Z"
              fill={color}
            />
          </svg>
        )
      }
      else if (icon === 'icon-add-note') {
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
              d="M13 11H11V14H8V16H11V19H13V16H16V14H13V11ZM14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z"
              fill={color}
            />
          </svg>
        )
      }
      else if (icon === 'icon-add-circle') {
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
              d="M13 7H11V11H7V13H11V17H13V13H17V11H13V7ZM12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
              fill={color}
            />
          </svg>
        )
      }
      else if (icon === 'icon-time-restore') {
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
              d="M13 3C8.03 3 4 7.03 4 12H1L4.89 15.89L4.96 16.03L9 12H6C6 8.13 9.13 5 13 5C16.87 5 20 8.13 20 12C20 15.87 16.87 19 13 19C11.07 19 9.32 18.21 8.06 16.94L6.64 18.36C8.27 19.99 10.51 21 13 21C17.97 21 22 16.97 22 12C22 7.03 17.97 3 13 3ZM12 8V13L16.28 15.54L17 14.33L13.5 12.25V8H12Z"
              fill={color}
            />
          </svg>
        )
      }
      else if (icon === 'icon-turn-right') {
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
              d="M20 9.99997L20.707 10.707L21.414 9.99997L20.707 9.29297L20 9.99997ZM3 18C3 18.2652 3.10536 18.5195 3.29289 18.7071C3.48043 18.8946 3.73478 19 4 19C4.26522 19 4.51957 18.8946 4.70711 18.7071C4.89464 18.5195 5 18.2652 5 18H3ZM15.707 15.707L20.707 10.707L19.293 9.29297L14.293 14.293L15.707 15.707ZM20.707 9.29297L15.707 4.29297L14.293 5.70697L19.293 10.707L20.707 9.29297ZM20 8.99997H10V11H20V8.99997ZM3 16V18H5V16H3ZM10 8.99997C8.14348 8.99997 6.36301 9.73747 5.05025 11.0502C3.7375 12.363 3 14.1435 3 16H5C5 14.6739 5.52678 13.4021 6.46447 12.4644C7.40215 11.5268 8.67392 11 10 11V8.99997Z"
              fill={color}
            />
          </svg>
        )
      }
      else if (icon === 'icon-turn-left') {
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
              d="M4.41406 9.99997L3.70706 10.707L3.00006 9.99997L3.70706 9.29297L4.41406 9.99997ZM21.4141 18C21.4141 18.2652 21.3087 18.5195 21.1212 18.7071C20.9336 18.8946 20.6793 19 20.4141 19C20.1488 19 19.8945 18.8946 19.707 18.7071C19.5194 18.5195 19.4141 18.2652 19.4141 18H21.4141ZM8.70706 15.707L3.70706 10.707L5.12106 9.29297L10.1211 14.293L8.70706 15.707ZM3.70706 9.29297L8.70706 4.29297L10.1211 5.70697L5.12106 10.707L3.70706 9.29297ZM4.41406 8.99997H14.4141V11H4.41406V8.99997ZM21.4141 16V18H19.4141V16H21.4141ZM14.4141 8.99997C16.2706 8.99997 18.0511 9.73747 19.3638 11.0502C20.6766 12.363 21.4141 14.1435 21.4141 16H19.4141C19.4141 14.6739 18.8873 13.4021 17.9496 12.4644C17.0119 11.5268 15.7401 11 14.4141 11V8.99997Z"
              fill={color}
            />
          </svg>
        )
      }
      else if (icon === 'icon-zoom-in') {
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
              d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z"
              fill={color}
            />
            <path d="M12 10H10V12H9V10H7V9H9V7H10V9H12V10Z" fill={color} />
          </svg>
        )
      }
      else if (icon === 'icon-zoom-out') {
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
              d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14ZM7 9H12V10H7V9Z"
              fill={color}
            />
          </svg>
        )
      }
      else {
        return null
      }
    }

    return renderIcon()
  },
)

Aicon.displayName = 'Aicon'

export default Aicon
