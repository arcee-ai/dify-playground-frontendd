import ast

def enable_authlib_http2(filename):
    """
    openwebui uses authlib's starlette client for oauth integreation
    arcee's IdP (zitadel) requires HTTP/2 for oauth, which is not enabled by default in authlib
    this function updates openwebui's utils/oauth.py to enable HTTP/2 for oauth, and is invoked within the dockerfile
    NOTE: httpx's optional http2 dependencies must be installed for this to work
    """
    with open(filename, 'r') as file:
        code = file.read()

    tree = ast.parse(code)
    for node in ast.walk(tree):
        if isinstance(node, ast.Call):
            if isinstance(node.func, ast.Attribute) and node.func.attr == 'register' and isinstance(node.func.value, ast.Attribute) and node.func.value.attr == 'oauth' and isinstance(node.func.value.value, ast.Name) and node.func.value.value.id == 'self':
                for kwarg in node.keywords:
                    if kwarg.arg == 'client_kwargs':
                        if isinstance(kwarg.value, ast.Dict):
                            print("Injecting http2=True into oauth client_kwargs")
                            kwarg.value.keys.append(ast.Constant('http2'))
                            kwarg.value.values.append(ast.Constant(value=True))

    with open(filename, 'w') as file:
        print("Updated openweb-ui's utils/oauth.py to enable HTTP/2 for OAuth")
        file.write(ast.unparse(tree))

enable_authlib_http2("/app/backend/open_webui/utils/oauth.py")
