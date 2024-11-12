import { Account, Avatars, Client, Databases, ID, Query, Storage } from 'react-native-appwrite';
import axios from 'axios';

export const appwriteConfig = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.milbratheduardo.zsul',
    projectId: '66acd9e100124f502bd9',
    databaseId: '66acda31000cc877959d',
    userCollectionId: '66acda4a00054c720a90',
    users_v1CollectionId: '67186ff4003a0a84cded',
    professional_v1CollectionId:'67188aa5001275afc709',
    workdays_v1CollectionId: '67188b52000b7386731a',
    atletas_v1CollectionId: '671abbad00392258726f',
    relatorios_v1CollectionId: '6721a8fe002fca8dc4c4',
    responsaveis_v1CollectionId: '671b0484003da7c2e564',
    metodologias_v1CollectionId: '67230f3000293a02fe2e',
    alunoCollectionId: '66acda860023ccfb7f13',
    turmaCollectionId: '66acdac50024492e0523',
    chamadaCollectionId: '66acdaee000fcb0006c2',
    eventoCollectionId: '66db57280002bca07979',
    galeriaCollectionId: '66faff5a003d06eaaa70',
    bucketID: '66e05918000a8ba9a1cc',
    bucketContratosID: '66fee5cf002a7360f3c4',
    bucketRelatoriosID: '6721a8a5002e4bf77f17',
    bucketTreinosID: '672317d70027c54ce1d7',
    contratosCollectionId: '67041c35001b7d8f6764'
}

const client = new Client();

client
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId) 
    .setPlatform(appwriteConfig.platform) 

    const account = new Account(client);
    const avatars = new Avatars(client);
    const databases = new Databases(client);
    const storage = new Storage(client);
    
    

    export const createUserProfessor = async (email, password, username, cpf, whatsapp, profession, modalidades, faixa_etaria, workdays) => {
      try {
        // Criação da conta Appwrite
        const newAccount = await account.create(
          ID.unique(),
          email,
          password
        );
    
        if (!newAccount) throw new Error("Account creation failed");
    
        // Gerar avatar a partir das iniciais do nome do usuário
        const avatarUrl = avatars.getInitials(username);
    
        // Login automático após a criação
        await signIn(email, password);
    
        // Salvar na tabela users_v1
        const userDoc = await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.users_v1CollectionId, // Coleção users_v1
          ID.unique(),
          {
            email,                   // Email do usuário
            userId: newAccount.$id,   // ID da conta do usuário
            role: 'profissional'         // Papel do usuário (professor)
          }
        );
    
        // Salvar na tabela profissionais_v1
        const professionalDoc = await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.professional_v1CollectionId, // Coleção profissionais_v1
          ID.unique(),
          {
            nome: username,           // Nome completo
            cpf,                      // CPF do professor
            whats: whatsapp,                 // WhatsApp do professor
            avatar: avatarUrl,        // URL do avatar com iniciais
            profissao: profession,    // Profissão selecionada
            modalidade: modalidades,  // Modalidades de esporte
            userId: newAccount.$id,   // ID da conta do usuário (referência à tabela users_v1)
            faixa_etaria              // Faixa etária selecionada
          }
        );
    
        // Salvar workdays (tabela workdays_v1)
        for (const day of workdays) {
          await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.workdays_v1CollectionId, // Coleção workdays_v1
            ID.unique(),
            {
              userId: newAccount.$id,   // ID da conta do usuário (referência à tabela users_v1)
              dias: day.dia,     // Dia da semana
              horario_inicial: day.start,  // Horário inicial
              horario_final: day.end    // Horário final
            }
          );
        }
    
        return { userDoc, professionalDoc };  // Retornar os documentos salvos para possível uso
      } catch (error) {
        console.error("Error in createUserProfessor:", error);
        throw new Error(error.message);
      }
    };
    
  

    export async function uploadImage(file) {
        if (!file) return;
      
        const { mimeType, ...rest } = file; // Extrai mimeType
        const asset = { type: mimeType, ...rest }; // Adiciona type com mimeType
      
        try {
          const uploadedFile = await storage.createFile(
            appwriteConfig.bucketID, // ID do bucket no Appwrite
            ID.unique(),             // ID único para o arquivo
            asset                    // Arquivo com type e outras propriedades
          );
      
          console.log('Upload realizado com sucesso:', uploadedFile.$id);
          return uploadedFile.$id;
        } catch (error) {
          console.error('Erro ao fazer upload do arquivo:', error);
          throw new Error('Erro ao fazer upload do arquivo: ' + error.message);
        }
      }

export const salvarImagem = async (file, title, userId) => {
        if (!file || !title || !userId) {
          throw new Error("Dados insuficientes para salvar a imagem. Certifique-se de que o arquivo, título e userId estão fornecidos.");
        }

        const { mimeType, ...rest } = file; // Extrai mimeType
        const asset = { type: mimeType, ...rest }; // Adiciona type com mimeType
      
        try {
          // Upload da imagem para o Appwrite Storage
          const fileUploaded = await storage.createFile(
            appwriteConfig.bucketID, // ID do bucket no Appwrite
            ID.unique(),             // ID único para o arquivo
            asset                     // Objeto do arquivo, que inclui uri, name e type
          );
      
          console.log('Upload realizado com sucesso:', fileUploaded.$id);
      
          // Salvar os dados no banco de dados 'Galeria'
          const response = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.galeriaCollectionId,
            ID.unique(),
            {
              ImageId: fileUploaded.$id,  // ID da imagem no storage
              title: title,
              userId: userId,  // ID do usuário que enviou
            }
          );
      
          console.log('Imagem salva na galeria:', response);
          return response; // Retorna o documento salvo
        } catch (error) {
          console.error('Erro ao salvar imagem na galeria:', error);
          throw new Error('Erro ao salvar imagem na galeria: ' + error.message);
        }
};

export const salvarImagemTreino = async (file, title, userId) => {
  if (!file || !title || !userId) {
    throw new Error("Dados insuficientes para salvar a imagem.");
  }

  const { mimeType, ...rest } = file; // Extrai mimeType
  const asset = { type: mimeType, ...rest };

  try {
    // Tentativa de upload do arquivo para o Appwrite Storage
    const fileUploaded = await storage.createFile(
      appwriteConfig.bucketTreinosID,
      ID.unique(),
      asset
    );

    // Verificação para garantir que o arquivo foi carregado com sucesso
    if (!fileUploaded || !fileUploaded.$id) {
      throw new Error("Falha no upload da imagem para o storage.");
    }

    return response;
  } catch (error) {
    console.error('Erro ao salvar imagem na galeria:', error.message);
    throw new Error('Erro ao salvar imagem na galeria: ' + error.message);
  }
};

export const getGaleriaImagens = async (userId) => {
  const query = [Query.equal('userId', userId)];
  const response = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.galeriaCollectionId,
    query
  );
  return response.documents;
};

export const deleteImageByImageId = async (imageId) => {
  if (!imageId) {
    throw new Error("ID da imagem não fornecido.");
  }

  try {
    // Buscar o documento no banco de dados onde ImageId == imageId
    const query = [
      Query.equal('ImageId', imageId) // Busca por documentos onde o campo 'ImageId' corresponde ao imageId do Storage
    ];
    
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.galeriaCollectionId,
      query
    );

    if (response.documents.length === 0) {
      throw new Error('Documento correspondente ao ImageId não encontrado.');
    }

    const documentId = response.documents[0].$id; // Pega o ID do documento encontrado

    // Deletar o documento da galeria correspondente no banco de dados
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.galeriaCollectionId,
      documentId // ID do documento a ser deletado
    );

    console.log('Documento da galeria deletado com sucesso:', documentId);
    return documentId; // Retorna o documento deletado
  } catch (error) {
    console.error('Erro ao deletar a imagem:', error);
    throw new Error('Erro ao deletar a imagem: ' + error.message);
  }
};   

export const salvarRelatorio = async ({ userId, turmaId, data, hora, metodologias, imagens}) => {
  if (!userId || !turmaId || !data || !hora || !metodologias) {
    throw new Error("Dados insuficientes para salvar o relatório. Certifique-se de que todos os campos obrigatórios estão preenchidos.");
  }

  try {
    const imagensIds = [];

    // Faz o upload de cada imagem e armazena o ID
    for (const imagem of imagens) {
      if (!imagem || !imagem.uri) {
        console.warn('Imagem inválida encontrada e ignorada:', imagem);
        continue;
      }
  
      try {
        const imageName = imagem.name || imagem.uri.split('/').pop();
        console.log('Tentando fazer upload da imagem:', imageName);
  
        const { mimeType, ...rest } = imagem; // Extrai mimeType
        const asset = { type: mimeType, ...rest };

       
  
        // Verifique se o método está corretamente configurado
        const fileUploaded = await storage.createFile(
          appwriteConfig.bucketTreinosID,
          ID.unique(),
          asset
        );

        // Certifique-se de que fileUploaded não é undefined
        if (!fileUploaded || !fileUploaded.$id) {
          throw new Error('Falha no upload: ID do arquivo não encontrado.');
        }

        imagensIds.push(fileUploaded.$id);
        console.log('Imagem enviada com sucesso:', fileUploaded.$id);
      } catch (error) {
        console.error('Erro ao fazer upload da imagem:', error.message);
        throw new Error('Erro ao fazer upload de uma das imagens.');
      }
    }
  
    // Criar o documento na coleção "relatorios" com os dados fornecidos
    const response = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.relatorios_v1CollectionId,
      ID.unique(),
      {
        userId,
        turmaId,
        data,
        hora,
        metodologias,
        imagens: imagensIds,
      }
    );

    console.log('Relatório salvo com sucesso:', response);
    return response;
  } catch (error) {
    console.error('Erro ao salvar relatório:', error);
    throw new Error('Erro ao salvar relatório: ' + error.message);
  }
};



      
    

export const createUserResponsavel = async (email,
  password,
  username,
  cpf,
  endereco,
  bairro,
  rg,
  whatsapp,
  birthDate,
  contatoalternativo,
  parentesco,) => {
    try {
      const newAccount = await account.create(ID.unique(), email, password);
      if (!newAccount) throw new Error('Falha ao criar conta');
  
      // Geração de avatar baseado nas iniciais do username
      const avatarUrl = avatars.getInitials(username);
  
      // Login automático após a criação
      await signIn(email, password);

      const userDoc = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.users_v1CollectionId, // Coleção de usuários
        ID.unique(),
        {
          userId: newAccount.$id, // ID da conta do usuário
          email,                  // Email do atleta
          role: 'responsavel',         // Definir o papel como 'atleta'
        }
      );
  
      // Dados a serem armazenados na coleção de atletas (atletas_v1)
      const responsavelDoc = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.responsaveis_v1CollectionId, // Coleção de atletas
        ID.unique(),
        {
          userId: newAccount.$id,       // ID da conta (linkado à tabela users_v1)
          nome: username,            // Nome completo do atleta
          cpf,                       // CPF do atleta
          whatsapp,                  // WhatsApp do atleta
          rg,                        // RG do atleta
          endereco,  
          bairro,                // Endereço do atleta              // Objetivo do atleta
          birthDate,
          parentesco,                 // Data de nascimento do atleta       // Ano escolar do atleta
          avatar: avatarUrl || null, // URL do avatar gerado a partir das iniciais
        }
      );
  
      return { userDoc, responsavelDoc }; // Retorna os documentos criados
    } catch (error) {
      console.error('Erro ao criar Responsavel:', error);
      throw new Error(error.message);
    }
  };

  export const createUserAtleta = async (
    email,
    password,
    username,
    cpf,
    whatsapp,
    rg,
    endereco,
    nomeResponsavel,
    posicao,
    peDominante,
    altura,
    peso,
    objetivo,
    birthDate,
    alergias,
    condicoesMedicas,
    lesoesAnteriores,
    primeiraEscola,
    anoEscolar
  ) => {
    try {
      // Criação de nova conta no Appwrite com email e senha
      const newAccount = await account.create(ID.unique(), email, password);
      if (!newAccount) throw new Error('Falha ao criar conta');
  
      // Geração de avatar baseado nas iniciais do username
      const avatarUrl = avatars.getInitials(username);
  
      // Login automático após a criação
      await signIn(email, password);
  
      // Dados a serem armazenados na coleção de usuários (users_v1)
      const userDoc = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.users_v1CollectionId, // Coleção de usuários
        ID.unique(),
        {
          userId: newAccount.$id, // ID da conta do usuário
          email,                  // Email do atleta
          role: 'atleta',         // Definir o papel como 'atleta'
        }
      );
  
      // Dados a serem armazenados na coleção de atletas (atletas_v1)
      const atletaDoc = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.atletas_v1CollectionId, // Coleção de atletas
        ID.unique(),
        {
          userId: newAccount.$id,       // ID da conta (linkado à tabela users_v1)
          nome: username,            // Nome completo do atleta
          cpf,                       // CPF do atleta
          whatsapp,                  // WhatsApp do atleta
          rg,                        // RG do atleta
          endereco,                  // Endereço do atleta
          nomeResponsavel,           // Nome do responsável
          posicao,                   // Posição do atleta
          peDominante,               // Pé dominante do atleta
          altura,                    // Altura do atleta
          peso,                      // Peso do atleta
          objetivo,                  // Objetivo do atleta
          birthDate,                 // Data de nascimento do atleta
          alergias,                  // Alergias do atleta
          condicoesMedicas,          // Condições médicas do atleta
          lesoesAnteriores,          // Lesões anteriores do atleta
          primeiraEscola,            // Primeira escola do atleta
          anoEscolar,                // Ano escolar do atleta
          avatar: avatarUrl || null, // URL do avatar gerado a partir das iniciais
        }
      );
  
      return { userDoc, atletaDoc }; // Retorna os documentos criados
    } catch (error) {
      console.error('Erro ao criar atleta:', error);
      throw new Error(error.message);
    }
  };
  




export const signIn = async (email, password) => {
    try {
        const session = await account.createEmailPasswordSession(email, password)

        return session;
    } catch (error) {
        throw new Error(error);
    }
}


export const getCurrentUser = async () => {
  try {
    // Pega a conta atual logada no Appwrite
    const currentAccount = await account.get();
    if (!currentAccount) throw new Error('Usuário não encontrado');

    // Busca o usuário na tabela de "users_v1CollectionId"
    let userResponse = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.users_v1CollectionId,
      [Query.equal('userId', currentAccount.$id)]
    );

    if (!userResponse || userResponse.total === 0) {
      throw new Error('Usuário não encontrado na tabela users_v1CollectionId');
    }

    const user = userResponse.documents[0];
    const role = user.role;
    

    if (role === 'profissional') {
      // Agora, busca na tabela "professional_v1CollectionId" onde o userId é igual
      let professionalResponse = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.professional_v1CollectionId,
        [Query.equal('userId', user.userId)]
      );

      // Se não encontrou na tabela "professional_v1CollectionId"
      if (!professionalResponse || professionalResponse.total === 0) {
        throw new Error('Usuário não encontrado na tabela professional_v1CollectionId');
      }

      const professional = professionalResponse.documents[0];

      // Combina as informações das duas tabelas e retorna o usuário completo
      return {
        ...user, // Dados do usuário da tabela users_v1CollectionId
        ...professional, // Dados do profissional da tabela professional_v1CollectionId
        role: user.role || 'user', // Assume que role será "user" se não estiver definida
      };
    } else if (role === 'atleta') {
      let atletaResponse = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.atletas_v1CollectionId,
        [Query.equal('userId', user.userId)]
      );

      // Se não encontrou na tabela "atletas_v1CollectionId"
      if (!atletaResponse || atletaResponse.total === 0) {
        throw new Error('Usuário não encontrado na tabela atletas_v1CollectionId');
      }

      const atleta = atletaResponse.documents[0];

      // Combina as informações das duas tabelas e retorna o usuário completo
      return {
        ...user, // Dados do usuário da tabela users_v1CollectionId
        ...atleta, // Dados do atleta da tabela atletas_v1CollectionId
        role: user.role || 'user', // Assume que role será "user" se não estiver definida
      };
    } else if (role === 'responsavel') {
      let responsavelResponse = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.responsaveis_v1CollectionId,
        [Query.equal('userId', user.userId)]
      );

      // Se não encontrou na tabela "atletas_v1CollectionId"
      if (!responsavelResponse || responsavelResponse.total === 0) {
        throw new Error('Usuário não encontrado na tabela atletas_v1CollectionId');
      }

      const responsavel = responsavelResponse.documents[0];

      // Combina as informações das duas tabelas e retorna o usuário completo
      return {
        ...user, // Dados do usuário da tabela users_v1CollectionId
        ...responsavel, // Dados do atleta da tabela atletas_v1CollectionId
        role: user.role || 'user', // Assume que role será "user" se não estiver definida
      };
    }
  } catch (error) {
    console.error('Erro ao buscar usuário atual:', error);
    throw new Error(error);
  }
};




export const getAllTurmas = async () => {
    try {
        const turmas = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.turmaCollectionId
        )

        return turmas.documents;
    } catch (error) {
        throw new Error(error);
    }
}

export const getAlunosByUserId = async (userId) => {
    try {
        const alunos = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.alunoCollectionId,
            [
                Query.equal('createdByUserId', userId) 
            ]
        );

        return alunos.documents;
    } catch (error) {
        throw new Error(error.message || 'Erro ao buscar alunos.');
    }
};


export const signOut = async () => {
    try {
        const session = await account.deleteSession('current');
        console.log("Sessão encerrada com sucesso:", session);
        return session;
    } catch (error) {
        console.error("Erro ao realizar logout:", error.message || error);
        throw new Error("Não foi possível realizar o logout. Tente novamente.");
    }
};



export const createTurma = async (title, Qtd_Semana, Dia1, Dia2, Dia3, Local, MaxAlunos, Horario_de_inicio, Horario_de_termino) => {
    try {
      const response = await databases.createDocument(
        appwriteConfig.databaseId, 
        appwriteConfig.turmaCollectionId, 
        ID.unique(), 
        {
          title,
          Qtd_Semana,
          Dia1,
          Dia2,
          Dia3,
          Local,
          MaxAlunos,
          Horario_de_inicio,
          Horario_de_termino
        }
      );
      return response;
    } catch (error) {
      throw new Error("Erro ao criar turma: " + error.message);
    }
  };

  export const createEvent = async (Title, Date_event, Description, Hora_event, type) => {
    try {
      console.log('Dados recebidos por createMatch:', { Title, Date_event, Description, Hora_event, type });
        const response = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.eventoCollectionId,
            ID.unique(),
            {
                Title,
                Date_event,
                Description,
                Hora_event,
                Type: type      // Armazena o tipo de evento (evento ou partida)
            }
        );
        return response;
    } catch (error) {
        throw new Error("Erro ao criar evento: " + error.message);
    }
};

export const createMatch = async (Title, Date_event, Description, Hora_event, Confirmados, type) => {
    try {
        const response = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.eventoCollectionId,
            ID.unique(),
            {
                Title,
                Date_event,
                Description,
                Hora_event,
                Confirmados,
                Type: type      // Armazena o tipo de evento (evento ou partida)
            }
        );
        return response;
    } catch (error) {
        throw new Error("Erro ao criar evento: " + error.message);
    }
};


  export const getAllEvents = async () => {
    try {
        const events = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.eventoCollectionId
        )

        return events.documents;
    } catch (error) {
        throw new Error(error);
    }
}

export const getEventsByDate = async (date) => {
    try {
        const events = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.eventoCollectionId,
            [
                Query.equal('Date_event', date) 
            ]
        );

        return events.documents;
    } catch (error) {
        throw new Error(error);
    }
};

export const getEventsForCurrentMonth = async () => {
  try {
      const today = new Date();
      const month = String(today.getMonth() + 1).padStart(2, '0'); // Mês atual com dois dígitos
      const year = today.getFullYear();

      // Buscar todos os eventos e filtrar pelo mês e ano atuais
      const allEvents = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.eventoCollectionId
      );

      // Filtrar eventos que ocorrem no mês e ano atuais
      const eventsInCurrentMonth = allEvents.documents.filter(event => {
          const [day, eventMonth, eventYear] = event.Date_event.split('-');
          return eventMonth === month && eventYear === String(year);
      });

      return eventsInCurrentMonth.length;
  } catch (error) {
      throw new Error(error.message || 'Erro ao buscar eventos do mês.');
  }
};

export const getImageUrl = async (imageId) => {
    try {
      const imageUrl = await storage.getFileView(appwriteConfig.bucketID, imageId);
      return imageUrl.href;  // Retorna a URL da imagem
    } catch (error) {
      console.error("Erro ao obter a URL da imagem:", error);
      throw new Error("Não foi possível obter a URL da imagem.");
    }
  };


export const getPdfUrl = async (fileId) => {
    try {
      const pdfUrl = await storage.getFileView(appwriteConfig.bucketContratosID, fileId);
      return pdfUrl.href;  // Retorna a URL do PDF
    } catch (error) {
      console.error("Erro ao obter a URL do PDF:", error);
      throw new Error("Não foi possível obter a URL do PDF.");
    }
  };
  
  

export const getAllAlunos = async () => {
    try {
        const alunos = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.atletas_v1CollectionId
        )

        return alunos.documents;
    } catch (error) {
        throw new Error(error);
    }
}

export const getAllUsers = async () => {
  try {
      const users = await databases.listDocuments(
          appwriteConfig.databaseId,    // ID do banco de dados
          appwriteConfig.userCollectionId // ID da coleção de usuários
      );

      return users.documents; // Retorna os documentos de usuários
  } catch (error) {
      throw new Error(error);
  }
};

export const getAlunosById = async (userId) => {
  try {
      const response = await databases.listDocuments(
          appwriteConfig.databaseId, 
          appwriteConfig.atletas_v1CollectionId, 
          [Query.equal('userId', userId)]
      );

      if (response.documents.length === 0) {
          throw new Error('Nenhum aluno encontrado com o userId fornecido.');
      }

      // Retorna o primeiro documento encontrado que corresponde ao userId
      return response.documents[0];
  } catch (error) {
      throw new Error('Erro ao buscar aluno pelo ID: ' + error.message);
  }
};


export const getMetodologias = async (userId) => {
  try {
      const response = await databases.listDocuments(
          appwriteConfig.databaseId, 
          appwriteConfig.metodologias_v1CollectionId, 
          [Query.equal('userId', userId)]
      );

      if (response.documents.length === 0) {
          throw new Error('Nenhuma metodologia encontrada com o userId fornecido.');
      }

      // Retorna o primeiro documento encontrado que corresponde ao userId
      return response.documents[0];
  } catch (error) {
      throw new Error('Erro ao buscar aluno pelo ID: ' + error.message);
  }
};

export const salvarMetodologia = async (userId, newMetodologia) => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.metodologias_v1CollectionId,
      [Query.equal('userId', userId)]
    );

    if (response.documents.length === 0) {
      throw new Error('Nenhuma metodologia encontrada com o userId fornecido.');
    }

    const documentId = response.documents[0].$id;
    const metodologiasAtualizadas = [...response.documents[0].metodologias, newMetodologia];

    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.metodologias_v1CollectionId,
      documentId,
      { metodologias: metodologiasAtualizadas }
    );
  } catch (error) {
    throw new Error('Erro ao salvar nova metodologia: ' + error.message);
  }
};

export const excluirMetodologia = async (userId, metodologiaToDelete) => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.metodologias_v1CollectionId,
      [Query.equal('userId', userId)]
    );

    if (response.documents.length === 0) {
      throw new Error('Nenhuma metodologia encontrada com o userId fornecido.');
    }

    const documentId = response.documents[0].$id;
    const metodologiasAtualizadas = response.documents[0].metodologias.filter(
      (metodologia) => metodologia !== metodologiaToDelete
    );

    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.metodologias_v1CollectionId,
      documentId,
      { metodologias: metodologiasAtualizadas }
    );
  } catch (error) {
    throw new Error('Erro ao excluir metodologia: ' + error.message);
  }
};


export const getUsersById = async (userId) => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,  // ID do banco de dados
      appwriteConfig.users_v1CollectionId,  // ID da coleção de usuários
      [Query.equal('userId', userId)]  // Consulta pelo campo `userId`
    );

    if (response.documents.length === 0) {
      throw new Error('Nenhum usuário encontrado com o userId fornecido.');
    }

    return response.documents[0]; // Retorna o primeiro documento encontrado
  } catch (error) {
    throw new Error('Erro ao buscar aluno pelo ID: ' + error.message);
  }
};
  
  export const getUsersByUserId = async (userId) => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        [
          Query.equal('userId', userId)
        ]
      );
  
      if (response.documents.length > 0) {
        return response.documents[0]; // Retorna o primeiro documento encontrado
      } else {
        throw new Error('Nenhum usuário encontrado com esse userId.');
      }
    } catch (error) {
      console.error('Erro ao buscar usuário pelo userId:', error.message);
      throw new Error('Erro ao buscar usuário pelo userId: ' + error.message);
    }
  };

  export const addAlunoToTurma = async (userId, turmaId) => {
    try {
      // Buscar o documento pelo campo userId
      const alunos = await databases.listDocuments(
        appwriteConfig.databaseId, 
        appwriteConfig.atletas_v1CollectionId, 
        [Query.equal("userId", userId)] // Filtro para encontrar o documento com o campo userId
      );
  
      if (alunos.documents.length === 0) {
        throw new Error("Aluno não encontrado.");
      }
  
      const alunoDocId = alunos.documents[0].$id;
  
    
      const updatedAluno = await databases.updateDocument(
        appwriteConfig.databaseId, 
        appwriteConfig.atletas_v1CollectionId, 
        alunoDocId, 
        { turmaId: turmaId }
      );
  
      return updatedAluno;
    } catch (error) {
      throw new Error(`Erro ao adicionar o aluno à turma: ${error.message}`);
    }
  };
  
  

  export const salvarChamada = async (chamadaData) => {
    try {
      const response = await databases.createDocument(
        appwriteConfig.databaseId, // ID do banco de dados
        appwriteConfig.chamadaCollectionId, // ID da coleção de chamadas
        ID.unique(), // ID único para o documento
        chamadaData // Dados da chamada: data, turma_id, presentes e ausentes
      );
      return response;
    } catch (error) {
      throw new Error(`Erro ao salvar a chamada: ${error.message}`);
    }
  };

  export const getChamadasByTurmaId = async (turmaId) => {
    try {
      const chamadas = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.chamadaCollectionId,
        [Query.equal('turma_id', turmaId)]
      );
      return chamadas.documents;
    } catch (error) {
      throw new Error(`Erro ao buscar chamadas: ${error.message}`);
    }
  };

  export const getAlunosByTurmaId = async (turmaId) => {
    try {
        const alunos = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.atletas_v1CollectionId,
            [
                Query.equal('turmaId', turmaId) 
            ]
        );

        return alunos.documents;
    } catch (error) {
        throw new Error(error.message || 'Erro ao buscar alunos.');
    }
};

  export const updateEventConfirmados = async (eventId, confirmados) => {
    try {
      // Primeiro, obtenha o documento original do evento
      const event = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.eventoCollectionId,
        eventId
      );
  
      // Crie um novo objeto contendo apenas os campos que precisam ser atualizados
      const updatedEvent = {
        Title: event.Title,
        Date_event: event.Date_event,
        Description: event.Description,
        Hora_event: event.Hora_event,
        Type: event.Type,
        Confirmados: confirmados, // Atualiza o campo Confirmados
        // Adicione aqui outros campos que o documento do evento possui
      };
  
      // Atualize o evento com os campos filtrados
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.eventoCollectionId,
        eventId,
        updatedEvent
      );
    } catch (error) {
      throw new Error('Erro ao atualizar o evento: ' + error.message);
    }
  };


  export const getTurmaById = async (turmaId) => {
    try {
      const turma = await databases.getDocument(
        appwriteConfig.databaseId,  // ID do banco de dados
        appwriteConfig.turmaCollectionId,  // ID da coleção de turmas
        turmaId  // ID do documento da turma
      );
      return turma;
    } catch (error) {
      throw new Error('Erro ao buscar turma pelo ID: ' + error.message);
    }
  };

  
export const updateChamada = async (chamadaId, { presentes, ausentes }) => {
    try {
      // Implemente a lógica para atualizar a chamada no banco de dados usando Appwrite
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.chamadaCollectionId,
        chamadaId,
        { presentes, ausentes }
      );
    } catch (error) {
      throw new Error('Erro ao atualizar chamada: ' + error.message);
    }
  };

  export const deleteChamadaById = async (chamadaId) => {
    try {
      // Lógica para deletar a chamada no banco de dados usando Appwrite
      await databases.deleteDocument(
        appwriteConfig.databaseId,          // ID do banco de dados
        appwriteConfig.chamadaCollectionId,  // ID da coleção de chamadas
        chamadaId                            // ID do documento (chamada) a ser deletado
      );
    } catch (error) {
      throw new Error('Erro ao deletar chamada: ' + error.message);
    }
  };

  // Função para deletar uma turma
export const deletarTurma = async (turmaId) => {
  try {
    // Lógica para deletar a turma no banco de dados usando Appwrite
    await databases.deleteDocument(
      appwriteConfig.databaseId,          // ID do banco de dados
      appwriteConfig.turmaCollectionId,   // ID da coleção de turmas
      turmaId                              // ID do documento (turma) a ser deletado
    );
  } catch (error) {
    throw new Error('Erro ao deletar turma: ' + error.message);
  }
};



  export const getAllImages = async () => {
    try {
      // Busca todos os documentos da coleção 'Galeria'
      const images = await databases.listDocuments(
        appwriteConfig.databaseId,       // ID do banco de dados
        appwriteConfig.galeriaCollectionId // ID da coleção 'Galeria'
      );
  
      // Mapeia para extrair apenas os campos necessários (neste caso, imageId, title, userId)
      const imageDetails = images.documents.map((doc) => ({
        imageId: doc.ImageId,
        title: doc.title,
        userId: doc.userId,
      }));
  
      return imageDetails; // Retorna apenas os detalhes selecionados
    } catch (error) {
      console.error('Erro ao buscar imagens da galeria:', error);
      throw new Error('Erro ao buscar imagens da galeria: ' + error.message);
    }
  };


 export const atualizarDiaCobranca = async (alunoId, diaCobranca) => {
    try {
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.alunoCollectionId,
        alunoId,
        {
          dia_cobranca: diaCobranca
        }
      );
    } catch (error) {
      console.error('Erro ao atualizar o dia da cobrança:', error);
      throw new Error('Erro ao salvar o dia da cobrança');
    }
  };

  export const updateAlunoContrato = async (alunoId, { tipo_contrato, indice_fluxo }) => {
    try {
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.alunoCollectionId,
        alunoId,
        {
          tipo_contrato: tipo_contrato,
          indice_fluxo: indice_fluxo
        }
      );
    } catch (error) {
      console.error('Erro ao atualizar o contrato do aluno:', error);
      throw new Error('Erro ao salvar as informações do contrato');
    }
  };

  export const updateAlunoFatura = async (alunoId, { pagamento }) => {
    try {
      await databases.updateDocument(
        appwriteConfig.databaseId,       // O ID do banco de dados do Appwrite
        appwriteConfig.alunoCollectionId, // O ID da coleção de alunos no Appwrite
        alunoId,                          // O ID do aluno a ser atualizado
        {
          pagamento: pagamento            // Atualizando a coluna 'pagamento' com o valor recebido
        }
      );
    } catch (error) {
      console.error('Erro ao atualizar a fatura do aluno:', error);
      throw new Error('Erro ao salvar as informações de pagamento');
    }
  };
  
  export const resetPagamento = async () => {
    try {
      const today = new Date();
      if (today.getDate() === 28) {
        // Supondo que você possa buscar todos os alunos com um filtro ou buscar todos de uma vez
        const alunosCollectionId = appwriteConfig.alunoCollectionId;
        const databaseId = appwriteConfig.databaseId;
  
        // Busca todos os alunos
        const alunos = await databases.listDocuments(databaseId, alunosCollectionId);
  
        // Atualiza o campo pagamento para null em todos os alunos
        const updatePromises = alunos.documents.map(async (aluno) => {
          await databases.updateDocument(
            databaseId,
            alunosCollectionId,
            aluno.$id,
            { pagamento: null } // Atualizando o campo pagamento para null
          );
        });
  
        await Promise.all(updatePromises);
        console.log('Coluna pagamento atualizada para null em todos os alunos.');
      }
    } catch (error) {
      console.error('Erro ao resetar a coluna pagamento:', error);
      throw new Error('Erro ao resetar o campo pagamento.');
    }
  };
  

  export const updateAlunoFluxo = async (alunoId, { indice_fluxo, token_contrato }) => {
    try {
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.alunoCollectionId,
        alunoId,
        {
          token_contrato: token_contrato,
          indice_fluxo: indice_fluxo
        }
      );
    } catch (error) {
      console.error('Erro ao atualizar o contrato do aluno:', error);
      throw new Error('Erro ao salvar as informações do contrato');
    }
  };







  
  

  
  
  
  
  

