import RegisterForm from '@/components/shared/RegisterForm'

const Register = () => {
  return (
    <>
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-3 md:py-4">
        <h3 className="text-[24px] font-bold leading-tight md:text-[30px] lg:text-[36px] text-center">
          Account erstellen
        </h3>
        <p className="text-center p-medium-12 md:p-regular-16 px-4 mt-2">
          Die Registrierung ist einfach und kostenlos.<br/>
          Fülle dazu das Formular aus, um zu beginnen.
        </p>
      </section>

      <div className="wrapper my-2">
        <RegisterForm />
      </div>
    </>
  )
}

export default Register