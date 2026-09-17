import EventForm from "@/components/shared/EventForm"

const CreateEvent = () => {

const mockUserId = "user_12345";

    return (
        <>
            <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
                <h3 className="text-[28px] font-bold leading-tight md:text-[34px] lg:text-[48px] text-center">Event erstellen</h3>
            </section>

            <div className="wrapper my-8">
                <EventForm userId={mockUserId} type="Create" />
            </div>
        </>
    )
}

export default CreateEvent
