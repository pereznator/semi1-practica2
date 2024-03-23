import pymysql

faunadex = pymysql.connect(
    host="semi1-grupo11-2.c5wy8g2o85ya.us-east-1.rds.amazonaws.com",
    port=3306,
    user="admin",
    password="semi12024,,",
    db="faunadex2",

)
fd = faunadex.cursor()
def Agregar_Usuario(Nombre_Usuario, Nombre_Completo, Password):
    consulta = "INSERT INTO Usuario (nombre_usuario,nombre_completo,password) VALUES (%s,%s,%s)"
    fd.execute(consulta,(Nombre_Usuario, Nombre_Completo, Password))
    faunadex.commit()
    consulta = "SELECT * FROM Usuario WHERE nombre_usuario=%s AND password=%s"
    fd.execute(consulta, (Nombre_Usuario, Password))
    resultado = fd.fetchone()  # Devuelve la primera fila, si no hay nada devuelve NONE
    if resultado:
        return resultado
    else:
        return -1

def Verificar_Credenciales(Nombre_Usuario, Password):
    consulta = "SELECT * FROM Usuario WHERE nombre_usuario=%s AND password=%s"
    fd.execute(consulta, (Nombre_Usuario, Password))
    resultado = fd.fetchone() #Devuelve la primera fila, si no hay nada devuelve NONE
    if resultado:
        return resultado
    else:
        return -1

def Obtener_Datos_Personales(Id_Del_Usuario):
    consulta = "SELECT * FROM Usuario WHERE usuario_id=%s"
    fd.execute(consulta, (Id_Del_Usuario))
    resultado = fd.fetchone() #Devuelve la primera fila, si no hay nada devuelve NONE
    if resultado:
        return resultado
    else:
        return -1

def Editar_Usuario(Id_Del_Usuario, Nombre_Usuario, Nombre_Completo, Password):
    consulta = "UPDATE Usuario SET"
    lista_parametros = []

    if Nombre_Usuario != "":
        consulta += " nombre_usuario = %s,"
        lista_parametros.append(Nombre_Usuario)

    if Nombre_Completo != "":
        consulta += " nombre_completo = %s,"
        lista_parametros.append(Nombre_Completo)

    if Password != "":
        consulta += " password = %s,"
        lista_parametros.append(Password)

    consulta = consulta.rstrip(',') + " WHERE usuario_id = %s"
    lista_parametros.append(Id_Del_Usuario)
    try:
        fd.execute(consulta, lista_parametros)
        faunadex.commit()
        consulta = "SELECT * FROM Usuario WHERE usuario_id=%s"
        fd.execute(consulta, (Id_Del_Usuario))
        resultado = fd.fetchone()
        return resultado
    except pymysql.Error as e_u:
        print("Error en la consulta")
        faunadex.rollback()
        return ""


def Agregar_Album(Nombre_Album, Id_Del_Usuario):
    consulta = "INSERT INTO Album (nombre_album,album_usuario_id) VALUES (%s,%s)"
    fd.execute(consulta,(Nombre_Album,Id_Del_Usuario))
    faunadex.commit()


def Crear_Nuevos_Albumes(Etiquetas,Id_Del_Usuario):
    c = 0
    Lista_Id_Album = []
    while c != len(Etiquetas):
        consulta = "SELECT COUNT(*) FROM Album WHERE nombre_album=%s AND album_usuario_id =%s"
        fd.execute(consulta, (Etiquetas[c],Id_Del_Usuario))
        resultado = fd.fetchone()[0]
        print("Exisite o no?")
        print(resultado)
        if resultado == 0:
            consulta = "INSERT INTO Album (nombre_album,album_usuario_id) VALUES (%s,%s)"
            fd.execute(consulta, (Etiquetas[c], Id_Del_Usuario))
            faunadex.commit()
        consulta = "SELECT * FROM Album WHERE nombre_album=%s AND album_usuario_id =%s"
        fd.execute(consulta, (Etiquetas[c], Id_Del_Usuario))
        resultado = fd.fetchone()[0]
        print("El id del album:")
        print(resultado)
        Lista_Id_Album.append(resultado)
        c += 1

    return Lista_Id_Album


def Obtener_Los_Albumes(Id_Del_Usuario):
    consulta = "SELECT * FROM Album WHERE album_usuario_id=%s"
    fd.execute(consulta, (Id_Del_Usuario,))
    resultado = fd.fetchall()
    if resultado:
        albumes_lista = []
        for album in resultado:
            album_id = album[0]
            consulta = "SELECT * FROM Foto WHERE foto_album_id=%s"
            fd.execute(consulta, (album_id,))
            fotos = fd.fetchall()
            fotos_lista = []
            c = 0
            while c != len(fotos):
                foto_tupla = fotos[c]
                foto_diccionario = {'foto_id': foto_tupla[0], 'nombre_foto': foto_tupla[1], 'descripcion': foto_tupla[2], 'foto_url': foto_tupla[4]}
                fotos_lista.append(foto_diccionario)
                c += 1
            album_diccionario = {'album_id': album[0], 'nombre_album': album[1], 'album_usuario_id': album[2], 'fotos': fotos_lista}
            albumes_lista.append(album_diccionario)
        return albumes_lista
    else:
        return -1

def Editar_Album(Id_Del_Album, Nombre_Nuevo):
    consulta = "UPDATE Album SET nombre_album = %s WHERE album_id = %s"
    lista_parametros = []
    lista_parametros.append(Nombre_Nuevo)
    lista_parametros.append(Id_Del_Album)
    try:
        fd.execute(consulta, lista_parametros)
        faunadex.commit()
        return
    except pymysql.Error as e_u:
        print("Error en la consulta")
        faunadex.rollback()
        return

def Borrar_Album(Id_Del_Album):
    consulta = "DELETE FROM Album WHERE album_id = %s"
    lista_parametros = []
    lista_parametros.append(Id_Del_Album)
    try:
        fd.execute(consulta, lista_parametros)
        faunadex.commit()
        return
    except pymysql.Error as e_u:
        print("Error en la consulta")
        faunadex.rollback()
        return

#def guardar_url_foto_perfil_en_db(Id_Usuario, Foto):
#    consulta = "UPDATE Usuarios SET foto = %s WHERE id = %s"
#    fd.execute(consulta, (Foto, Id_Usuario))
#    faunadex.commit()

def Guardar_Enlace_S3(Id_Del_Usuario,Url,Nombre_Foto):
    consulta = "INSERT INTO Album (nombre_album,album_usuario_id) VALUES (%s,%s)"
    fd.execute(consulta,("Fotos del perfil",Id_Del_Usuario))
    faunadex.commit()

    consulta = "SELECT * FROM Album WHERE album_usuario_id=%s AND nombre_album=%s"
    fd.execute(consulta, (Id_Del_Usuario, "Fotos del perfil"))
    Album_Fotos_del_perfil = fd.fetchone()

    consulta = "INSERT INTO Foto (nombre_foto,foto_album_id,foto_url) VALUES (%s,%s,%s)"
    fd.execute(consulta, (Nombre_Foto, Album_Fotos_del_perfil[0], Url))
    faunadex.commit()

    consulta = "SELECT LAST_INSERT_ID() FROM Foto AS id"
    fd.execute(consulta)
    Ultimo_Id_Tupla = fd.fetchone()
    Ultimo_Id = Ultimo_Id_Tupla[0]

    consulta = "UPDATE Usuario SET foto_perfil_id = %s WHERE usuario_id = %s"
    fd.execute(consulta, (Ultimo_Id, Id_Del_Usuario))
    faunadex.commit()

    consulta = "SELECT * FROM Usuario WHERE usuario_id=%s"
    fd.execute(consulta, (Id_Del_Usuario))
    resultado = fd.fetchone()  # Devuelve la primera fila, si no hay nada devuelve NONE
    if resultado:
        return resultado
    else:
        return -1

def Actualizar_Enlace_S3(Id_Del_Usuario,Url,Nombre_Foto):

    consulta = "SELECT * FROM Album WHERE album_usuario_id=%s AND nombre_album=%s"
    fd.execute(consulta, (Id_Del_Usuario, "Fotos del perfil"))
    Album_Fotos_del_perfil = fd.fetchone()

    consulta = "INSERT INTO Foto (nombre_foto,foto_album_id,foto_url) VALUES (%s,%s,%s)"
    fd.execute(consulta, (Nombre_Foto, Album_Fotos_del_perfil[0], Url))
    faunadex.commit()

    consulta = "SELECT LAST_INSERT_ID() FROM Foto AS id"
    fd.execute(consulta)
    Ultimo_Id_Tupla = fd.fetchone()
    Ultimo_Id = Ultimo_Id_Tupla[0]

    consulta = "UPDATE Usuario SET foto_perfil_id = %s WHERE usuario_id = %s"
    fd.execute(consulta, (Ultimo_Id, Id_Del_Usuario))
    faunadex.commit()

    consulta = "SELECT * FROM Usuario WHERE usuario_id=%s"
    fd.execute(consulta, (Id_Del_Usuario))
    resultado = fd.fetchone()  # Devuelve la primera fila, si no hay nada devuelve NONE
    if resultado:
        return resultado
    else:
        return -1


def Guardar_Foto(Id_Del_Album,Url,Nombre_Foto,Descripcion):
    consulta = "INSERT INTO Foto (nombre_foto,foto_album_id,descripcion,foto_url) VALUES (%s,%s,%s,%s)"
    fd.execute(consulta, (Nombre_Foto, Id_Del_Album, Descripcion, Url))
    faunadex.commit()
    return

def Obtener_Foto_Actual(Id_Foto):
    consulta = "SELECT * FROM Foto WHERE foto_id=%s"
    fd.execute(consulta, (Id_Foto))
    resultado = fd.fetchone()  # Devuelve la primera fila, si no hay nada devuelve NONE
    if resultado[3] != None:
        return resultado[3]
    else:
        return ""

def obtener_usuario_por_nombre(nombre_usuario):
  consulta = "SELECT * FROM Usuario WHERE nombre_usuario =%s "
  fd.execute(consulta, (nombre_usuario))
  resultado = fd.fetchone()
  return resultado

def obtener_foto_por_id(foto_id):
  consulta = "SELECT * FROM Foto WHERE foto_id =%s "
  fd.execute(consulta, (foto_id))
  resultado = fd.fetchone()
  return resultado
