import { memo } from 'react'
import Aicon from '../../base/a-icon'
import Button from '@/app/components/base/button'
import { useStore } from '@/app/components/workflow/store'

const EnvButton = ({ disabled }: { disabled: boolean }) => {
  const setShowChatVariablePanel = useStore(s => s.setShowChatVariablePanel)
  const setShowEnvPanel = useStore(s => s.setShowEnvPanel)
  const setShowDebugAndPreviewPanel = useStore(
    s => s.setShowDebugAndPreviewPanel,
  )

  const handleClick = () => {
    setShowEnvPanel(true)
    setShowChatVariablePanel(false)
    setShowDebugAndPreviewPanel(false)
  }

  return (
    <Button
      variant="ghost"
      size="medium"
      className="btn-icon"
      disabled={disabled}
      onClick={handleClick}
    >
      <Aicon size={20} icon="icon-env" className="a-icon--btn" />
    </Button>
  )
}

export default memo(EnvButton)
