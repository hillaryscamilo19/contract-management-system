export default function NotificationSettingsPreview() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-gray-800">Sistema de Contratos</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a
                  href="#"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dashboard
                </a>
                <a
                  href="#"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Clientes
                </a>
                <a
                  href="#"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Contratos
                </a>
                <a
                  href="#"
                  className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Configuración
                </a>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="ml-3 relative">
                <div>
                  <button
                    type="button"
                    className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    id="user-menu-button"
                  >
                    <span className="sr-only">Abrir menú de usuario</span>
                    <img
                      className="h-8 w-8 rounded-full"
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      alt=""
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Configuración de Notificaciones</h1>

          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <form className="space-y-8 divide-y divide-gray-200">
                <div className="space-y-8 divide-y divide-gray-200">
                  <div>
                    <div>
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Notificaciones por Email</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Configure cuándo se enviarán notificaciones por email para los contratos por vencer.
                      </p>
                    </div>

                    <div className="mt-6">
                      <fieldset>
                        <legend className="text-base font-medium text-gray-900">Recordatorios de vencimiento</legend>
                        <div className="mt-4 space-y-4">
                          <div className="relative flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                id="notify-30"
                                name="notify-30"
                                type="checkbox"
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                defaultChecked
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="notify-30" className="font-medium text-gray-700">
                                30 días antes del vencimiento
                              </label>
                              <p className="text-gray-500">Enviar un primer recordatorio con un mes de anticipación.</p>
                            </div>
                          </div>
                          <div className="relative flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                id="notify-15"
                                name="notify-15"
                                type="checkbox"
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                defaultChecked
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="notify-15" className="font-medium text-gray-700">
                                15 días antes del vencimiento
                              </label>
                              <p className="text-gray-500">Enviar un segundo recordatorio dos semanas antes.</p>
                            </div>
                          </div>
                          <div className="relative flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                id="notify-7"
                                name="notify-7"
                                type="checkbox"
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                defaultChecked
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="notify-7" className="font-medium text-gray-700">
                                7 días antes del vencimiento
                              </label>
                              <p className="text-gray-500">Enviar un recordatorio urgente una semana antes.</p>
                            </div>
                          </div>
                          <div className="relative flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                id="notify-1"
                                name="notify-1"
                                type="checkbox"
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                defaultChecked
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="notify-1" className="font-medium text-gray-700">
                                1 día antes del vencimiento
                              </label>
                              <p className="text-gray-500">
                                Enviar un recordatorio final el día anterior al vencimiento.
                              </p>
                            </div>
                          </div>
                        </div>
                      </fieldset>
                    </div>
                  </div>

                  <div className="pt-8">
                    <div>
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Plantilla de Email</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Personalice el contenido de los emails de notificación.
                      </p>
                    </div>
                    <div className="mt-6">
                      <div className="sm:col-span-6">
                        <label htmlFor="email-template" className="block text-sm font-medium text-gray-700">
                          Plantilla
                        </label>
                        <div className="mt-1">
                          <textarea
                            id="email-template"
                            name="email-template"
                            rows={10}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            defaultValue={`Estimado/a {clientName},

Le informamos que su contrato número {contractNumber} vencerá en {daysLeft} días ({expirationDate}).

Por favor, póngase en contacto con nosotros para renovar su contrato.

Saludos cordiales,
El equipo de gestión de contratos`}
                          />
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                          Puede usar las siguientes variables: {"{clientName}"}, {"{contractNumber}"},{" "}
                          {"{expirationDate}"}, {"{daysLeft}"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8">
                    <div>
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Probar Notificaciones</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Envíe un email de prueba para verificar la configuración.
                      </p>
                    </div>
                    <div className="mt-6 flex items-center">
                      <div className="w-96">
                        <label htmlFor="test-email" className="block text-sm font-medium text-gray-700">
                          Email de prueba
                        </label>
                        <div className="mt-1">
                          <input
                            type="email"
                            name="test-email"
                            id="test-email"
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="ejemplo@correo.com"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        className="ml-4 mt-6 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Enviar Prueba
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-5">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Guardar Configuración
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
