import { MainController } from "./controller/MainController"
import { UserEditsFoodController } from "./controller/UserEditsFoodController"

export const Routes = [{
    method: "get",
    route: "/submissions",
    controller: MainController,
    action: "userEditsFoodAll"
}, 
{
    method: "get",
    route: "/submissions/:id",
    controller: MainController,
    action: "userEditsFoodOne"
}, 
{
    method: "post",
    route: "/submissions/:id",
    controller: MainController,
    action: "userEditsFoodUpdate"
},
{
    method: "post",
    route: "/submissions-images",
    controller: UserEditsFoodController,
    action: "uploadImage"
},
{
    method: "post",
    route: "/submissions",
    controller: UserEditsFoodController,
    action: "save"
}, 
{
    method: "delete",
    route: "/submissions/:id",
    controller: MainController,
    action: "userEditsFoodRemove"
},
// food local
{
    method: "get",
    route: "/submissions-food",
    controller: MainController,
    action: "foodLocalAll"
}, 
{
    method: "get",
    route: "/submissions-food/:id",
    controller: MainController,
    action: "foodLocalOne"
}, 
// additives
{
    method: "get",
    route: "/submissions-additives/",
    controller: MainController,
    action: "additiveAll"
}, 
{
    method: "post",
    route: "/submissions-additives/",
    controller: MainController,
    action: "additiveSave"
}, 
{
    method: "get",
    route: "/submissions-additives/:id",
    controller: MainController,
    action: "additiveOne"
}, 
{
    method: "post",
    route: "/submissions-additives/:id",
    controller: MainController,
    action: "additiveUpdate"
}, 
{
    method: "delete",
    route: "/submissions-additives/:id",
    controller: MainController,
    action: "additiveRemove"
}, 
// allergen
{
    method: "get",
    route: "/submissions-allergens/",
    controller: MainController,
    action: "allergenAll"
}, 
{
    method: "post",
    route: "/submissions-allergens/",
    controller: MainController,
    action: "allergenSave"
}, 
{
    method: "get",
    route: "/submissions-allergens/:id",
    controller: MainController,
    action: "allergenOne"
}, 
{
    method: "delete",
    route: "/submissions-allergens/:id",
    controller: MainController,
    action: "allergenRemove"
},
]