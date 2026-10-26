import EventForm from "@/components/shared/EventForm"

const CreateEvent = () => {

    return (
        <>
            <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-3 md:py-4">
                <h3 className="text-[24px] font-bold leading-tight md:text-[30px] lg:text-[36px] text-center">Event erstellen</h3>
            </section>

            <div className="wrapper my-2">
                <EventForm
                    type="Create" />
            </div>
        </>
    )
}

export default CreateEvent
