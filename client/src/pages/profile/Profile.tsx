import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Collection from '@/components/shared/Collection'
import { dummyUsers, dummyEvents, dummyAttendees } from '@/constants/dummy-data'
import { getInitials } from '@/lib/utils'

import editIcon from '@/assets/icons/edit.svg'
import userIcon from '@/assets/icons/username.svg'   
import mailIcon from '@/assets/icons/email.svg'    
import infoIcon from '@/assets/icons/bio.svg'


type TabType = 'teilnehmer' | 'ersteller'

const Profile = () => {
// später: Aktuellen Benutzer aus dem State/Kontext laden
  const currentUser = dummyUsers[0]
  
 // Zustand für Tab-Steuerung
  const [activeTab, setActiveTab] = useState<TabType>('teilnehmer')

  const attendeeEventIds = dummyAttendees
    .filter((a) => a.userId === currentUser.id)
    .map((a) => a.eventId)

  const participatingEvents = dummyEvents.filter((event) =>
    attendeeEventIds.includes(event.id)
  )

  const organizedEvents = dummyEvents.filter(
    (event) => event.ownerId === currentUser.id
  )

  if (!currentUser) return null

  const userName = currentUser.name || `User #${currentUser.id}`

  return (
    <>
     {/* Benutzerprofil */}
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center border border-b-primary-500/40">
        <div className="wrapper flex flex-col gap-8 md:flex-row md:justify-between md:items-start">
          
          {/* Bearbeiten-Button - Mobile */}
          <div className="flex flex-col sm:flex-row gap-6 md:gap-10 items-center sm:items-start">
            <Link 
            to="/profile/update" 
            title="Profil bearbeiten" 
            className="md:hidden self-end hover:scale-105 transition-opacity"
          >
            <img src={editIcon} alt="Bearbeiten" width={24} height={24} />
          </Link>

            {/* Avatar und Infos */}
            <Avatar className="h-32 w-32 md:h-40 md:w-40 border-2 border-primary-500/70 shadow-sm ring-1 ring-slate-200">
              <AvatarImage src={currentUser.avatarUrl} alt={userName} className="object-cover" />
              <AvatarFallback className="bg-secondary-dark text-white text-4xl font-semibold">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>

            {/* Benutzerdaten */}
            <div className="flex flex-col gap-4 text-center sm:text-left">
              <h2 className="text-[24px] font-bold md:text-[28px]">Mein Profil</h2>
              
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-center sm:justify-start gap-3">
                  <img src={userIcon} alt="Name" width={20} height={20} />
                  <span className="p-medium-18 text-black">{currentUser.name}</span>
                </div>

                <div className="flex items-center justify-center sm:justify-start gap-3">
                  <img src={mailIcon} alt="Email" width={20} height={20} />
                  <span className="p-medium-18 text-black">{currentUser.email}</span>
                </div>

                {currentUser.bio && (
                  <div className="flex items-center justify-center sm:justify-start gap-3">
                    <img src={infoIcon} alt="Bio" width={20} height={20} />
                    <span className="p-medium-18 text-black">{currentUser.bio}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

            {/* Bearbeiten-Button - Desktop */}
            <Button asChild variant="outline" className="hidden md:flex gap-2 bg-white hover:bg-primary/70 text-black border-primary-500/40">
              <Link to="/profile/update">
                <img src={editIcon} alt="Bearbeiten" width={16} height={16} />
                Profil bearbeiten
              </Link>
            </Button>
          </div>
      </section>

      {/* Event-Liste - Tabs */}
      <section className="wrapper flex flex-col gap-4">
        <h3 className="text-[24px] font-bold text-center md:text-start md:text-[28px]">Meine Events</h3>
        
        {/* Tab-Navigation */}
        <div className="flex gap-8 border-b border-primary-500/40 pb-2">
          <button
            onClick={() => setActiveTab('teilnehmer')}
            className={`p-medium-20 pb-2 transition-all hover:text-primary-500 relative ${
              activeTab === 'teilnehmer' 
                ? 'text-black font-bold after:content-[""] after:absolute after:left-0 after:bottom-[-9px] after:w-full after:h-[3px] after:bg-primary-500' 
                : 'text-gray-500'
            }`}
          >
            Teilnehmer
          </button>
          <button
            onClick={() => setActiveTab('ersteller')}
            className={`p-medium-20 pb-2 transition-all hover:text-primary-500 relative ${
              activeTab === 'ersteller' 
                ? 'text-black font-bold after:content-[""] after:absolute after:left-0 after:bottom-[-9px] after:w-full after:h-[3px] after:bg-primary-500' 
                : 'text-gray-500'
            }`}
          >
            Ersteller
          </button>
        </div>

        {/* Tab-Inhalte */}
        <div>
          {activeTab === 'teilnehmer' ? (
            <Collection
              data={participatingEvents}
              emptyTitle="Noch keine Event-Zusagen"
              emptyStateSubtext="Sie nehmen derzeit an keinen Events teil."
              emptyStateShowButton={false}
              collectionType="My_Events"
              currentUserId={currentUser.id}
              attendeeEventIds={attendeeEventIds}
              limit={6}
            />
          ) : (
            <Collection
              data={organizedEvents}
              emptyTitle="Noch keine Events erstellt"
              emptyStateSubtext="Erstellen Sie jetzt Ihr erstes Event."
              emptyStateShowButton={true}
              collectionType="Events_Organized"
              currentUserId={currentUser.id}
              attendeeEventIds={attendeeEventIds}
              limit={6}
            />
          )}
        </div>
      </section>
    </>
  )
}

export default Profile