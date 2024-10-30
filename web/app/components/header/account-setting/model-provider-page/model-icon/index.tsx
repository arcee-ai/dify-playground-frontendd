import type { FC } from 'react'
import type { Model, ModelProvider } from '../declarations'
import { useLanguage } from '../hooks'
import arceeLogo from './arcee-logo.jpg'
import { CubeOutline } from '@/app/components/base/icons/src/vender/line/shapes'

type ModelIconProps = {
  provider?: Model | ModelProvider
  modelName?: string
  className?: string
}
const ModelIcon: FC<ModelIconProps> = ({ provider, className, modelName }) => {
  const language = useLanguage()

  if (
    provider?.provider === 'openai'
    && (modelName?.startsWith('gpt-4') || modelName?.includes('4o'))
  ) {
    return (
    /* <OpenaiViolet className={`w-4 h-4 ${className}`} /> */
      <img
        alt="model-icon"
        src={arceeLogo.src}
        className={`w-4 h-4 ${className}`}
      />
    )
  }

  if (provider?.icon_small) {
    return (
      <img
        alt="model-icon"
        src={
          /* `${provider.icon_small[language] || provider.icon_small.en_US}` */ arceeLogo.src
        }
        className={`w-4 h-4 ${className}`}
      />
    )
  }

  return (
    <div
      className={`
      flex items-center justify-center w-6 h-6 rounded border-[0.5px] border-black/5 bg-gray-50
      ${className}
    `}
    >
      <CubeOutline className="w-4 h-4 text-gray-400" />
    </div>
  )
}

export default ModelIcon
