data "aws_lambda_function" "chatbot" {
  function_name = "${local.service}-${var.stage}-core"
  provider      = aws.ap-southeast-1
}
