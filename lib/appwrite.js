import { Account, Avatars, Client, Databases, ID, Query, Storage } from 'react-native-appwrite';

export const appwriteConfig = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.milbratheduardo.zsul',
    projectId: '66acd9e100124f502bd9',
    databaseId: '66acda31000cc877959d',
    userCollectionId: '66acda4a00054c720a90',
    alunoCollectionId: '66acda860023ccfb7f13',
    turmaCollectionId: '66acdac50024492e0523',
    chamadaCollectionId: '66acdaee000fcb0006c2',
    eventoCollectionId: '66db57280002bca07979',
    galeriaCollectionId: '66faff5a003d06eaaa70',
    bucketID: '66e05918000a8ba9a1cc'
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
    
    

    export const createUserProfessor = async (email, password, username, cpf, whatsapp) => {
        try {
            const newAccount = await account.create(
                ID.unique(),
                email,
                password
            );
    
            if (!newAccount) throw new Error("Account creation failed");
    
            const avatarUrl = avatars.getInitials(username);
    
            await signIn(email, password);
    
            const newUserProfessor = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                ID.unique(),
                {
                    userId: newAccount.$id,
                    email,
                    username,
                    avatar: avatarUrl,
                    whatsapp,
                    cpf,
                    role: 'professor'
                }
            );
    
            return newUserProfessor;
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
      
      
    

export const createUserResponsavel = async (email,password,username,
    cpf,endereco, bairro, rg, whatsapp, role) => {
    try {
        const newAccount = await account.create(
            ID.unique(),
            email,
            password
        )

        if(!newAccount) throw Error;

        const avatarUrl = avatars.getInitials(username)

        await signIn(email, password)

        const newUserResponsavel = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            {
                userId: newAccount.$id,
                email,
                username,
                avatar: avatarUrl,
                whatsapp,
                cpf,
                endereco,
                bairro,
                rg,
                role: 'responsavel'
            }
        )

        return newUserResponsavel;
    } catch (error) {
        console.log(Error);
        throw new Error(error);
    }
}

export const createAluno = async (email, password, username, nascimento, rg, escola, ano, whatsapp, createdByUsername, createdByUserId) => {
    try {
        let newAccount = null;
        let avatarUrl = '';

        if (email && password) {
            newAccount = await account.create(
                ID.unique(),
                email,
                password
            );

            if (!newAccount) throw new Error('Falha ao criar conta');

            avatarUrl = avatars.getInitials(username);

            await signIn(email, password);
        }

        const documentData = {
            email: email || null,
            username,
            avatar: avatarUrl || null,
            nascimento,
            rg,
            escola,
            ano,
            whatsapp,
            createdByUsername,
            createdByUserId,    
            role: 'aluno'
        };

        
        if (newAccount) {
            documentData.userId = newAccount.$id;
        }

        const newUserAluno = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.alunoCollectionId,
            ID.unique(),
            documentData
        );

        return newUserAluno;
    } catch (error) {
        console.error('Erro ao criar aluno:', error);
        throw new Error(error);
    }
}





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
        const currentAccount = await account.get();

        if(!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('userId', currentAccount.$id)]
        )

        if(!currentUser) throw Error;

        return currentUser.documents[0];
    } catch (error) {
        console.log(error);
    }
}

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

  export const createEvent = async (Title, Date_event, Description, Hora_event, ImageID, Type) => {
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
                ImageID,  // Armazena o ID da imagem
                Type      // Armazena o tipo de evento (evento ou partida)
            }
        );
        return response;
    } catch (error) {
        throw new Error("Erro ao criar evento: " + error.message);
    }
};

export const createMatch = async (Title, Date_event, Description, Hora_event, ImageID, Confirmados, Type) => {
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
                ImageID,  // Armazena o ID da imagem
                Confirmados,
                Type      // Armazena o tipo de evento (evento ou partida)
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

export const getImageUrl = async (imageId) => {
    try {
      const imageUrl = await storage.getFileView(appwriteConfig.bucketID, imageId);
      return imageUrl.href;  // Retorna a URL da imagem
    } catch (error) {
      console.error("Erro ao obter a URL da imagem:", error);
      throw new Error("Não foi possível obter a URL da imagem.");
    }
  };
  

export const getAllAlunos = async () => {
    try {
        const alunos = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.alunoCollectionId
        )

        return alunos.documents;
    } catch (error) {
        throw new Error(error);
    }
}

export const getAlunosById = async (alunoId) => {
    try {
      const aluno = await databases.getDocument(
        appwriteConfig.databaseId,  // ID do banco de dados
        appwriteConfig.alunoCollectionId,  // ID da coleção de alunos
        alunoId  // ID do documento do aluno
      );
  
      return aluno; // Retorna o documento do aluno
    } catch (error) {
      throw new Error('Erro ao buscar aluno pelo ID: ' + error.message);
    }
  };

  export const addAlunoToTurma = async (alunoId, turmaId) => {
    try {
      const updatedAluno = await databases.updateDocument(
        appwriteConfig.databaseId, 
        appwriteConfig.alunoCollectionId, 
        alunoId, 
        { turma_id: turmaId } 
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
            appwriteConfig.alunoCollectionId,
            [
                Query.equal('turma_id', turmaId) 
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
  
  
  
  
  

