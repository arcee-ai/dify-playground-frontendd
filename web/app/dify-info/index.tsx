import React from 'react'
import Image from 'next/image'
import difyLogo from './dify-logo.png'

const DifyInfo: React.FC = () => {
  return (
    <a href="https://dify.ai/" className="flex items-center gap-2 fixed z-100 bottom-4 right-4">
      <Image src={difyLogo} alt="Dify Logo" height={32} width={32} className="border border-gray-100 rounded-full" />
      <span className="text-sm font-medium text-gray-500">Powered by Dify</span>
    </a>
  )
}

export default DifyInfo
