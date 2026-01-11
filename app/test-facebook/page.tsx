'use client'

export default function TestFacebookPage() {
  const clientId = '857255943688482'
  const redirectUri = encodeURIComponent('http://localhost:3000/api/auth/callback/facebook')
  const scope = 'public_profile'
  const authType = 'rerequest'
  
  const facebookUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&auth_type=${authType}`

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Test Facebook OAuth</h1>
      
      <div className="mb-8 p-4 bg-gray-100 rounded">
        <h2 className="font-bold mb-2">URL que DEVERIA ser usada:</h2>
        <code className="text-sm break-all">{facebookUrl}</code>
      </div>

      <div className="space-y-4">
        <a 
          href={facebookUrl}
          className="block w-fit px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          🔗 Testar OAuth Direto
        </a>
        
        <a 
          href="/api/auth/signin"
          className="block w-fit px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700"
        >
          🔐 Login via NextAuth
        </a>
      </div>

      <div className="mt-8 p-4 bg-yellow-50 rounded">
        <h3 className="font-bold mb-2">Instruções:</h3>
        <ol className="list-decimal list-inside space-y-2">
          <li>Clique em <strong>"Testar OAuth Direto"</strong> primeiro</li>
          <li>Se funcionar → problema está no NextAuth</li>
          <li>Se NÃO funcionar → problema está no Facebook App</li>
        </ol>
      </div>
    </div>
  )
}
