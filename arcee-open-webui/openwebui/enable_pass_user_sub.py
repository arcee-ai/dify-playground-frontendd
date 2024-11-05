import ast

class OAuthSubInjector(ast.NodeTransformer):
    def visit_Call(self, node):
        # Check if it's a call to requests.post
        if (isinstance(node.func, ast.Attribute) and
            isinstance(node.func.value, ast.Name) and
            node.func.value.id == 'requests' and
            node.func.attr == 'post'):
            # Find the 'json' keyword argument
            for kw in node.keywords:
                if kw.arg == 'json' and isinstance(kw.value, ast.Dict):
                    json_dict = kw.value
                    # Find the 'user' key in the json dict
                    for i, key in enumerate(json_dict.keys):
                        if isinstance(key, ast.Constant) and key.value == 'user':
                            user_dict = json_dict.values[i]
                            if isinstance(user_dict, ast.Dict):
                                # Inject 'oauth_sub': user.oauth_sub
                                user_dict.keys.append(ast.Constant(value='oauth_sub'))
                                user_dict.values.append(
                                    ast.Attribute(
                                        value=ast.Name(id='user', ctx=ast.Load()),
                                        attr='oauth_sub',
                                        ctx=ast.Load()
                                    )
                                )
                            break
        # Continue visiting child nodes
        self.generic_visit(node)
        return node

def inject_oauth_sub_user_response(filename):
    """
    Injects the 'oauth_sub' field into the 'UserResponse' class in auths.py
    """
    with open(filename, 'r') as file:
        code = file.read()

    tree = ast.parse(code)
    for node in ast.walk(tree):
        if isinstance(node, ast.ClassDef) and node.name == 'UserResponse':
            for field in node.body:
                if isinstance(field, ast.AnnAssign) and field.target.id == 'oauth_sub':
                    break
            else:
                oauth_sub_field = ast.AnnAssign(
                    target=ast.Name(id='oauth_sub', ctx=ast.Store()),
                    annotation=ast.BinOp(
                        left=ast.Name(id='str', ctx=ast.Load()),
                        op=ast.BitOr(),
                        right=ast.Constant(value=None, kind=None)
                    ),
                    value=ast.Constant(value=None, kind=None),
                    simple=1
                )
                node.body.insert(3, oauth_sub_field)  # Insert after 'name' field

    ast.fix_missing_locations(tree)
    with open(filename, 'w') as file:
        print("Updated auths.py to add 'oauth_sub' field to 'UserResponse' class")
        file.write(ast.unparse(tree))

def inject_oauth_sub_user_main(filename):
    """
    Injects the 'oauth_sub' field on the '__user__' object in openwebui's main.py
    """
    with open(filename, 'r') as file:
        code = file.read()

    tree = ast.parse(code)
    for node in ast.walk(tree):
        if isinstance(node, ast.Dict):
            for key, value in zip(node.keys, node.values):
                if isinstance(key, ast.Constant) and key.s == '__user__':
                    if isinstance(value, ast.Dict):
                        value.keys.append(ast.Constant('oauth_sub'))
                        value.values.append(ast.Attribute(attr='oauth_sub', value=ast.Name(id='user', ctx=ast.Load()), ctx=ast.Load()))
        if isinstance(node, ast.Assign):
            if isinstance(node.targets[0], ast.Name) and node.targets[0].id == '__user__':
                if isinstance(node.value, ast.Dict):
                    node.value.keys.append(ast.Constant('oauth_sub'))
                    node.value.values.append(ast.Attribute(attr='oauth_sub', value=ast.Name(id='user', ctx=ast.Load()), ctx=ast.Load()))
        if isinstance(node, ast.FunctionDef) and node.name == 'filter_pipeline':
            for stmt in node.body:
                if isinstance(stmt, ast.Assign) and isinstance(stmt.value, ast.Dict):
                    if len(stmt.targets) == 1 and isinstance(stmt.targets[0], ast.Name) and stmt.targets[0].id == 'user':
                        stmt.value.keys.append(ast.Constant('oauth_sub'))
                        stmt.value.values.append(ast.Attribute(attr='oauth_sub', value=ast.Name(id='user', ctx=ast.Load()), ctx=ast.Load()))

    # Inject oauth_sub into user properties passed to requests json
    injector = OAuthSubInjector()
    new_tree = injector.visit(tree)
    ast.fix_missing_locations(new_tree)

    with open(filename, 'w') as file:
        print("Updated openweb-ui's main.py to add 'oauth_sub' field on '__user__' object")
        file.write(ast.unparse(new_tree))

inject_oauth_sub_user_main("/app/backend/open_webui/main.py")
inject_oauth_sub_user_response("/app/backend/open_webui/apps/webui/models/auths.py")
