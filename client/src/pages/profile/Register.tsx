import RegisterForm from '@/components/shared/RegisterForm'

const Register = () => {
  return (
    <>
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center border border-b-primary-500/40 py-5 md:py-10">
        <h3 className="text-[28px] font-bold leading-tight md:text-[34px] lg:text-[48px] text-center">
          Account erstellen
        </h3>
        <p className="text-center p-medium-12 md:p-regular-16 px-4 mt-2 text-secondary-dark">
          Die Registrierung ist einfach und kostenlos.<br/>
          Fülle dazu das Formular aus, um zu beginnen.
        </p>
      </section>

      <div className="wrapper my-8">
        <RegisterForm />
      </div>
    </>
  )
}

export default Register