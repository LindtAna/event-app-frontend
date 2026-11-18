import RegisterForm from '@/components/shared/RegisterForm'
import { useTranslation } from "react-i18next"

const Register = () => {
  const { t } = useTranslation()

  return (
    <>
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-3 md:py-4">
        <h3 className="text-[24px] font-bold leading-tight md:text-[30px] lg:text-[36px] text-center">
          {t("registerPage.title")}
        </h3>
        <p className="text-center p-medium-12 md:p-regular-16 px-4 mt-2">
           {t("registerPage.descriptionFirstLine")}
          <br />
          {t("registerPage.descriptionSecondLine")}
        </p>
      </section>

      <div className="wrapper my-2">
        <RegisterForm />
      </div>
    </>
  )
}

export default Register