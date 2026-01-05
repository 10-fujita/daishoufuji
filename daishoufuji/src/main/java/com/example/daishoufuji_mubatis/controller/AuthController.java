package com.example.daishoufuji_mubatis.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/auth")
public class AuthController {
	//welcomページ表示
@GetMapping("/")
public String toppage() {
	return "auth/welcome";
}
//トップページへ遷移
@GetMapping("/top")
public String top() {
	return "auth/top";
}
//新規会員登録へ遷移
@GetMapping("/regist")
public String regist() {
	return "auth/regist";
}
@GetMapping("/reset")
public String reset() {
	return "auth/reset";
}
@PostMapping("/regist")
public String registSubmit() {
	return "auth/reCheck";
}
@GetMapping("/correct")
public String correct() {
	return "auth/regist";
}
@PostMapping("/doregist")
public String doRegistSubmit() {
  return "auth/login";
}