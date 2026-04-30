import { PatientChatClient } from "../../../../components/chat/PatientChatClient";
import { getDictionary } from "../../../i18n/get-dictionary";

export default async function ChatPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }> | { lang: string };
  searchParams: Promise<{ patientId?: string }> | { patientId?: string };
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const dict = await getDictionary(resolvedParams.lang as any);
  
  // Simulated patient identification for dev
  const patientId = resolvedSearchParams.patientId;

  if (!patientId) {
    return (
      <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
        <h1 className="text-xl font-bold">Simulación de Paciente</h1>
        <p className="opacity-70 mt-2">
          Para ver el chat, por favor añade <code className="bg-base-200 px-2 py-1 rounded">?patientId=tu_id_de_convex</code> a la URL.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full max-h-screen flex flex-col pt-16 lg:pt-0">
      <PatientChatClient dict={dict} lang={resolvedParams.lang} patientId={patientId} />
    </div>
  );
}
