import Header from '../../components/header/Header';

const data = [
  {
    id: 1,
    title: 'Pothole on Main Street',
    description:
      'A large pothole has formed on Main Street, causing traffic disruptions and potential damage to vehicles.',
    location: 'Main Street, Dschang',
    status: 'PENDING',
    dateReported: '2024-06-01',
    reporter: 'Duval Moi',
  },
  {
    id: 2,
    title: 'Streetlight Outage',
    description:
      'Several streetlights on Avenue de la Paix are not functioning, creating safety concerns for pedestrians and drivers at night.',
    location: 'Avenue de la Paix, Dschang',
    status: 'IN_PROGRESS',
    dateReported: '2024-06-02',
    reporter: 'Amina Tchoua',
  },
  {
    id: 3,
    title: 'Illegal Dumping Site',
    description:
      'An illegal dumping site has been reported near the riverbank, with large amounts of waste being discarded in the area.',
    location: 'Riverbank, Dschang',
    status: 'RESOLVED',
    dateReported: '2024-06-03',
    reporter: 'Jean-Pierre Nguemo',
  },
  {
    id: 4,
    title: 'Broken Traffic Light',
    description:
      'The traffic light at the intersection of Rue des Fleurs and Boulevard de la Liberté is malfunctioning, causing confusion for drivers.',
    location: 'Rue des Fleurs & Boulevard de la Liberté, Dschang',
    status: 'PENDING',
    dateReported: '2024-06-04',
    reporter: 'Sophie Mvogo',
  },
  {
    id: 5,
    title: 'Graffiti Vandalism',
    description:
      'Several buildings in the downtown area have been vandalized with graffiti, affecting the aesthetic appeal of the neighborhood.',
    location: 'Downtown Dschang',
    status: 'IN_PROGRESS',
    dateReported: '2024-06-05',
    reporter: 'Marcelle Tchoua',
  },
  {
    id: 6,
    title: 'Water Leakage',
    description:
      'A water pipe has burst on Rue de la Paix, causing flooding and water supply issues for nearby residents.',
    location: 'Rue de la Paix, Dschang',
    status: 'RESOLVED',
    dateReported: '2024-06-06',
    reporter: 'Emmanuel Nguemo',
  },
  {
    id: 7,
    title: 'Abandoned Vehicle',
    description:
      'An abandoned vehicle has been reported on the side of the road near the market, creating an obstruction for traffic.',
    location: 'Near Market, Dschang',
    status: 'PENDING',
    dateReported: '2024-06-07',
    reporter: 'Isabelle Mvogo',
  },
  {
    id: 8,
    title: 'Noise Pollution',
    description:
      'Residents have reported excessive noise from a construction site on Avenue des Arts, disrupting the peace in the neighborhood.',
    location: 'Avenue des Arts, Dschang',
    status: 'IN_PROGRESS',
    dateReported: '2024-06-08',
    reporter: 'Pauline Tchoua',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-50">
      <Header />
      <div className="container font-bold flex flex-col gap-5 my-10">
        {data.map((report) => (
          <div
            key={report.id}
            className="bg-white p-5 rounded-lg shadow-md w-full"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex flex-col items-start">
                <span className="text-lg font-bold">{report.reporter}</span>
                <span className="text-sm text-gray-500 ml-2">
                  {report.dateReported}
                </span>
              </div>
              <span
                className={`text-sm font-semibold px-2 py-1 rounded-full border ${report.status === 'PENDING' ? 'bg-yellow-200 text-yellow-800' : report.status === 'IN_PROGRESS' ? 'bg-blue-200 text-blue-800' : 'bg-green-200 text-green-800'}`}
              >
                {report.status}
              </span>
            </div>
            <h2 className="text-xl font-semibold mb-2">{report.title}</h2>
            <p className="text-gray-700 mb-4">{report.description}</p>
            <p className="text-sm text-gray-500">Location: {report.location}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
