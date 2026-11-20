import ProfileForm from '@/components/shared/ProfileForm'
import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from "react-i18next"

const UpdateProfile = () => {
const { t } = useTranslation()
  const { user: currentUser } = useAuth()

 if (!currentUser) {
    return (
      <div className="wrapper my-8 text-center">
        <h2 className="text-2xl font-bold">
          {t("updateProfilePage.loginRequired")}</h2>
      </div>
    )
  }

  return (
    <>
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-3 md:py-4">
        <h3 className="text-[24px] font-bold leading-tight md:text-[30px] lg:text-[36px] text-center">
          {t("updateProfilePage.title")}
        </h3>
      </section>

      <div className="wrapper my-2">
        <ProfileForm
          type="Update"
          user={currentUser}
        />
      </div>
    </>
  )
}

export default UpdateProfile