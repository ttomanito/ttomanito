import { IconButton } from "@chakra-ui/react"
import { LuArrowLeft } from "react-icons/lu"
import { useNavigate } from "react-router-dom"

const BackButton = () => {
  const navigate = useNavigate()

  return (
    <IconButton
      aria-label="뒤로 가기"
      variant="ghost"
      onClick={() => navigate(-1)}
    >
      <LuArrowLeft />
    </IconButton>
  )
}

export default BackButton
