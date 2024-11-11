import type { FC } from 'react'

type LogoEmbeddedChatAvatarProps = {
  className?: string
}
const LogoEmbeddedChatAvatar: FC<LogoEmbeddedChatAvatarProps> = ({
  className,
}) => {
  return (
    <img
      src='/logo/favicon.png'
      className={`block w-10 h-10 ${className}`}
      alt='logo'
    />
  )
}

export default LogoEmbeddedChatAvatar
